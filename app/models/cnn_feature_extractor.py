# app/models/cnn_feature_extractor.py

from tensorflow.keras.applications import ResNet50

cnn_model = None

def load_cnn_model():
    global cnn_model
    cnn_model = ResNet50(
        weights="imagenet",
        include_top=False,
        pooling="avg",
        input_shape=(224, 224, 3)
    )
    return cnn_model
