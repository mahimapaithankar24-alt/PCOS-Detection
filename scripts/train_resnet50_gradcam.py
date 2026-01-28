"""
Train a ResNet50 classifier for Grad-CAM visualization.
This model is trained on ALL three datasets: Kaggle, MMOTU, and PCOSGen.
Used ONLY for explainability, not final PCOS prediction.
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import models, transforms
from PIL import Image
import numpy as np
from pathlib import Path
from tqdm import tqdm
from sklearn.model_selection import train_test_split

# =====================================================
# PATHS
# =====================================================
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ULTRASOUND_DIR = PROJECT_ROOT / "data" / "ultrasound" / "processed"
MODEL_SAVE_PATH = PROJECT_ROOT / "models" / "resnet50_gradcam.pth"

# All three datasets
DATASET_PATHS = [
    ULTRASOUND_DIR / "kaggle",
    ULTRASOUND_DIR / "mmotu",
    ULTRASOUND_DIR / "pcosgen"
]

# =====================================================
# HYPERPARAMETERS
# =====================================================
IMG_SIZE = 224
BATCH_SIZE = 24
EPOCHS = 25
LEARNING_RATE = 1e-4

# =====================================================
# DATASET WITH STRATIFIED SPLIT
# =====================================================
class UltrasoundDataset(Dataset):
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        try:
            img = Image.open(img_path).convert("RGB")
            if self.transform:
                img = self.transform(img)
            return img, label
        except Exception as e:
            print(f"⚠️ Error loading {img_path}: {e}")
            return torch.zeros(3, IMG_SIZE, IMG_SIZE), label

# =====================================================
# TRANSFORMS
# =====================================================
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# =====================================================
# MAIN TRAINING FUNCTION
# =====================================================
def main():
    print("\n" + "="*60)
    print("📊 LOADING ALL DATASETS")
    print("="*60)

    # Collect all samples
    all_samples = []
    dataset_stats = {}
    
    for dataset_path in DATASET_PATHS:
        if not dataset_path.exists():
            print(f"⚠️  {dataset_path.name.upper():10s}: NOT FOUND")
            continue
            
        name = dataset_path.name.upper()
        pcos_samples = [(p, 1) for p in (dataset_path / "pcos").glob("*.jpg")]
        non_pcos_samples = [(p, 0) for p in (dataset_path / "non_pcos").glob("*.jpg")]
        
        all_samples.extend(pcos_samples)
        all_samples.extend(non_pcos_samples)
        
        dataset_stats[name] = {
            'pcos': len(pcos_samples),
            'non_pcos': len(non_pcos_samples),
            'total': len(pcos_samples) + len(non_pcos_samples)
        }
        
        print(f"📂 {name:10s}: PCOS={len(pcos_samples):4d} | Non-PCOS={len(non_pcos_samples):4d} | Total={dataset_stats[name]['total']:4d}")

    if not all_samples:
        raise ValueError("❌ No datasets found!")

    print(f"\n✅ TOTAL: {len(all_samples)} images")

    # =====================================================
    # STRATIFIED TRAIN/VAL SPLIT
    # =====================================================
    samples_array = np.array(all_samples, dtype=object)
    labels_array = np.array([label for _, label in all_samples])
    
    train_samples, val_samples, train_labels, val_labels = train_test_split(
        samples_array, labels_array, 
        test_size=0.2, 
        stratify=labels_array,
        random_state=42
    )
    
    print(f"\n🔀 STRATIFIED SPLIT:")
    print(f"   Train: {len(train_samples)} (PCOS={np.sum(train_labels==1)}, Non-PCOS={np.sum(train_labels==0)})")
    print(f"   Val:   {len(val_samples)} (PCOS={np.sum(val_labels==1)}, Non-PCOS={np.sum(val_labels==0)})")

    # =====================================================
    # WEIGHTED SAMPLING FOR BALANCED BATCHES
    # =====================================================
    class_counts = np.bincount(train_labels)
    class_weights_array = 1.0 / class_counts
    sample_weights = class_weights_array[train_labels]
    
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )
    
    # Create datasets
    train_dataset = UltrasoundDataset(train_samples.tolist(), transform=train_transform)
    val_dataset = UltrasoundDataset(val_samples.tolist(), transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, sampler=sampler, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # =====================================================
    # MODEL
    # =====================================================
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n🖥️  Device: {device}")
    
    if torch.cuda.is_available():
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)

    # Unfreeze last ResNet block for fine-tuning
    for param in model.parameters():
        param.requires_grad = False
    
    # Unfreeze layer4 (last conv block)
    for param in model.layer4.parameters():
        param.requires_grad = True

    # Classifier
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 512),
        nn.ReLU(),
        nn.BatchNorm1d(512),
        nn.Dropout(0.4),
        nn.Linear(512, 2)
    )

    model.to(device)

    # =====================================================
    # LOSS & OPTIMIZER
    # =====================================================
    # Focal Loss for hard examples
    class FocalLoss(nn.Module):
        def __init__(self, alpha=0.25, gamma=2):
            super().__init__()
            self.alpha = alpha
            self.gamma = gamma
            
        def forward(self, inputs, targets):
            ce_loss = nn.functional.cross_entropy(inputs, targets, reduction='none')
            pt = torch.exp(-ce_loss)
            focal_loss = self.alpha * (1-pt)**self.gamma * ce_loss
            return focal_loss.mean()
    
    criterion = FocalLoss(alpha=0.25, gamma=2)
    
    # Separate learning rates for backbone and classifier
    optimizer = optim.AdamW([
        {'params': model.layer4.parameters(), 'lr': LEARNING_RATE / 10},  # Lower LR for backbone
        {'params': model.fc.parameters(), 'lr': LEARNING_RATE}
    ], weight_decay=1e-4)
    
    scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(
        optimizer, T_0=5, T_mult=2, eta_min=1e-7
    )

    # =====================================================
    # TRAINING LOOP
    # =====================================================
    print("\n" + "="*60)
    print("🚀 STARTING TRAINING")
    print("="*60)

    best_val_acc = 0.0
    best_pcos_f1 = 0.0
    patience = 0
    max_patience = 8

    for epoch in range(EPOCHS):
        # TRAINING
        model.train()
        train_loss = 0
        train_correct = 0
        train_total = 0

        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [TRAIN]"):
            imgs, labels = imgs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()

            train_loss += loss.item()
            train_correct += (outputs.argmax(1) == labels).sum().item()
            train_total += labels.size(0)

        train_acc = train_correct / train_total

        # VALIDATION
        model.eval()
        val_correct = 0
        val_total = 0
        val_preds = []
        val_true = []

        with torch.no_grad():
            for imgs, labels in tqdm(val_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [VAL]  "):
                imgs, labels = imgs.to(device), labels.to(device)
                outputs = model(imgs)
                preds = outputs.argmax(1)
                
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)
                val_preds.extend(preds.cpu().numpy())
                val_true.extend(labels.cpu().numpy())

        val_acc = val_correct / val_total
        val_preds = np.array(val_preds)
        val_true = np.array(val_true)
        
        # Per-class metrics
        non_pcos_acc = np.mean(val_preds[val_true == 0] == 0) if np.any(val_true == 0) else 0
        pcos_acc = np.mean(val_preds[val_true == 1] == 1) if np.any(val_true == 1) else 0
        
        # F1 Score for PCOS class
        tp = np.sum((val_preds == 1) & (val_true == 1))
        fp = np.sum((val_preds == 1) & (val_true == 0))
        fn = np.sum((val_preds == 0) & (val_true == 1))
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

        print(f"\n📊 Epoch {epoch+1}/{EPOCHS}:")
        print(f"   Train Loss: {train_loss/len(train_loader):.4f} | Train Acc: {train_acc:.4f}")
        print(f"   Val Acc: {val_acc:.4f} | Non-PCOS: {non_pcos_acc:.4f} | PCOS: {pcos_acc:.4f}")
        print(f"   PCOS F1: {f1:.4f} | Precision: {precision:.4f} | Recall: {recall:.4f}")
        
        scheduler.step()
        print(f"   LR: {optimizer.param_groups[0]['lr']:.6f}")

        # Save best model based on balanced metric
        balanced_score = (val_acc + f1) / 2
        
        if balanced_score > (best_val_acc + best_pcos_f1) / 2:
            best_val_acc = val_acc
            best_pcos_f1 = f1
            patience = 0
            
            torch.save({
                'model_state_dict': model.state_dict(),
                'epoch': epoch,
                'val_acc': val_acc,
                'pcos_f1': f1,
                'pcos_acc': pcos_acc,
                'non_pcos_acc': non_pcos_acc
            }, MODEL_SAVE_PATH)
            print(f"   ✅ Best model saved (Balanced Score: {balanced_score:.4f})")
        else:
            patience += 1
            print(f"   ⏳ No improvement ({patience}/{max_patience})")

        if patience >= max_patience:
            print(f"\n🛑 Early stopping at epoch {epoch+1}")
            break
        
        print("-" * 60)

    print("\n" + "="*60)
    print(f"🎉 TRAINING COMPLETE")
    print(f"   Best Val Acc: {best_val_acc:.4f}")
    print(f"   Best PCOS F1: {best_pcos_f1:.4f}")
    print(f"💾 Model saved to: {MODEL_SAVE_PATH}")
    print("="*60)


if __name__ == '__main__':
    main()
