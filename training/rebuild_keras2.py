import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

weights_path = "training/model_out/fsl_weights.npz"
output_path = "training/model_out/fsl_model_keras2.h5"

inputs = layers.Input(shape=(16, 63), name="landmark_window")

x = layers.Bidirectional(
    layers.GRU(
        128,
        return_sequences=True,
        dropout=0.2,
        recurrent_dropout=0.0,
        reset_after=False,
    )
)(inputs)

x = layers.Bidirectional(
    layers.GRU(
        64,
        return_sequences=False,
        dropout=0.2,
        recurrent_dropout=0.0,
        reset_after=False,
    )
)(x)

x = layers.Dense(128, activation="relu")(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(64, activation="relu")(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(4, activation="softmax", name="class_probs")(x)

model = models.Model(inputs, outputs, name="fsl_bigru_v2")

with np.load(weights_path) as data:
    weights = [data[f"arr_{i}"] for i in range(len(data.files))]

model.set_weights(weights)
model.save(output_path)

print("Compatible model saved:", output_path)
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)
