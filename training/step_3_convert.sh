#!/usr/bin/env bash
# Step 3: Convert trained Keras model (.h5) to TensorFlow.js format
# for browser-based inference.
#
# Usage:
#   bash step_3_convert.sh [keras_model.h5] [output_dir]
#
# Defaults:
#   keras_model.h5 -> training/model_out/fsl_model.h5
#   output_dir -> public/models/fsl_model_tfjs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

KERAS_MODEL="${1:-$PROJECT_DIR/training/model_out/fsl_model.h5}"
OUTPUT_DIR="${2:-$PROJECT_DIR/public/models/fsl_model_tfjs}"

if [ ! -f "$KERAS_MODEL" ]; then
  echo "ERROR: Keras model not found at $KERAS_MODEL"
  echo "  Run training first: python train.py --dataset fsl_dataset.json --out training/model_out"
  exit 1
fi

echo "Converting $KERAS_MODEL -> $OUTPUT_DIR ..."
mkdir -p "$OUTPUT_DIR"

# tensorflowjs_converter needs to be installed:
#   pip install tensorflowjs
tensorflowjs_converter \
  --input_format=keras \
  --output_format=tfjs_layers_model \
  "$KERAS_MODEL" \
  "$OUTPUT_DIR"

echo ""
echo "Conversion complete. Model files in $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. Copy label_map.json from training/model_out/ to $OUTPUT_DIR/label_map.json"
echo "  2. Update INFERENCE_LABELS in src/inference/labels.ts to match label_map.json order"
echo "  3. Update App.tsx to load /models/fsl_model_tfjs/model.json instead of the old model"
