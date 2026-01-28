"""
Grad-CAM visualization service for ultrasound images.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np
import cv2
from pathlib import Path
import io
import base64

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "resnet50_gradcam.pth"

class GradCAM:
    """Generate Grad-CAM heatmaps."""
    
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_full_backward_hook(self.save_gradient)
    
    def save_activation(self, module, input, output):
        self.activations = output.detach()
    
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()
    
    def generate_cam(self, input_tensor, class_idx=None):
        """Generate CAM for given input."""
        # Forward pass
        self.model.eval()
        output = self.model(input_tensor)
        
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()
        
        # Backward pass
        self.model.zero_grad()
        output[0, class_idx].backward()
        
        # Generate CAM
        pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
        
        # Weight activations by gradients
        for i in range(self.activations.shape[1]):
            self.activations[:, i, :, :] *= pooled_gradients[i]
        
        # Average across channels
        heatmap = torch.mean(self.activations, dim=1).squeeze().cpu().numpy()
        
        # ReLU and normalize
        heatmap = np.maximum(heatmap, 0)
        heatmap = heatmap / (heatmap.max() + 1e-8)
        
        return heatmap, class_idx, output


class GradCAMService:
    """Service for generating Grad-CAM visualizations."""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load ResNet50 model
        self.model = models.resnet50(weights=None)
        
        # Modify classifier to match training architecture
        self.model.fc = nn.Sequential(
            nn.Linear(self.model.fc.in_features, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.4),
            nn.Linear(512, 2)
        )
        
        # Load trained weights
        if MODEL_PATH.exists():
            # FIX: Add weights_only=False for PyTorch 2.6+ compatibility
            # This is safe because we trust our own trained model
            checkpoint = torch.load(
                MODEL_PATH, 
                map_location=self.device,
                weights_only=False  # Allow loading our custom trained model
            )
            self.model.load_state_dict(checkpoint['model_state_dict'])
            print(f"✅ Loaded ResNet50 Grad-CAM model from {MODEL_PATH}")
            print(f"   Val Acc: {checkpoint.get('val_acc', 0):.4f}")
            print(f"   PCOS F1: {checkpoint.get('pcos_f1', 0):.4f}")
            print(f"   Epoch: {checkpoint.get('epoch', 'N/A')}")
        else:
            print(f"⚠️ ResNet model not found at {MODEL_PATH}")
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Initialize Grad-CAM with layer4 (last conv layer before pooling)
        self.gradcam = GradCAM(self.model, self.model.layer4[-1])
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        print(f"✅ Grad-CAM service initialized on {self.device}")
    
    def generate_heatmap(self, image_bytes):
        """
        Generate Grad-CAM heatmap for an ultrasound image.
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            dict with heatmap overlay, prediction, and confidence
        """
        try:
            # Load and preprocess image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            original_img = np.array(image)
            
            # Transform for model
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Generate heatmap
            with torch.set_grad_enabled(True):
                heatmap, predicted_class, output = self.gradcam.generate_cam(
                    input_tensor, 
                    class_idx=1  # Focus on PCOS class (class 1)
                )
            
            # Get prediction probabilities
            probs = torch.softmax(output, dim=1)[0].cpu().detach().numpy()
            pcos_confidence = float(probs[1])
            non_pcos_confidence = float(probs[0])
            
            # Resize heatmap to match original image
            heatmap_resized = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
            
            # Create colored heatmap (using JET colormap)
            heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
            heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
            
            # Overlay heatmap on original image
            overlay = cv2.addWeighted(original_img, 0.6, heatmap_colored, 0.4, 0)
            
            # Convert to base64 for frontend
            _, buffer = cv2.imencode('.png', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
            overlay_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Also create standalone heatmap
            _, heatmap_buffer = cv2.imencode('.png', heatmap_colored)
            heatmap_base64 = base64.b64encode(heatmap_buffer).decode('utf-8')
            
            return {
                "heatmap_overlay": f"data:image/png;base64,{overlay_base64}",
                "heatmap_only": f"data:image/png;base64,{heatmap_base64}",
                "predicted_class": "PCOS" if predicted_class == 1 else "Non-PCOS",
                "pcos_probability": pcos_confidence,
                "non_pcos_probability": non_pcos_confidence,
                "confidence": pcos_confidence if predicted_class == 1 else non_pcos_confidence,
                "class_index": int(predicted_class)
            }
        
        except Exception as e:
            print(f"❌ Error generating Grad-CAM heatmap: {e}")
            raise


# Global instance
try:
    gradcam_service = GradCAMService()
except Exception as e:
    print(f"⚠️ Failed to initialize GradCAM service: {e}")
    print(f"   This is likely due to missing model file at: {MODEL_PATH}")
    gradcam_service = None