
import json
from pathlib import Path

# Dataset paths
INPUT_FILE = Path("training/fsl_dataset.json")
OUTPUT_FILE = Path("training/fsl_dataset_windows.json")

WINDOW_SIZE = 16
STRIDE = 2


def main():
    with INPUT_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    feature_dim = data.get("featureDim", 63)
    labels = data.get("labels", [])
    source_samples = data.get("samples", [])

    if feature_dim != 63:
        raise ValueError(
            f"Expected 63 features per frame, got {feature_dim}"
        )

    windowed_samples = []

    for sample_index, sample in enumerate(source_samples):
        label = sample.get("label")
        frames = sample.get("frames", [])
        frame_count = sample.get("frameCount", 0)

        expected_length = frame_count * feature_dim

        if len(frames) != expected_length:
            raise ValueError(
                f"Sample {sample_index} ({label}): "
                f"frameCount says {frame_count}, but "
                f"there are {len(frames)} numbers."
            )

        # Split the flattened recording into individual frames.
        recording = [
            frames[i * feature_dim:(i + 1) * feature_dim]
            for i in range(frame_count)
        ]

        # Generate overlapping windows.
        for start in range(
            0, frame_count - WINDOW_SIZE + 1, STRIDE
        ):
            window = recording[start:start + WINDOW_SIZE]

            windowed_samples.append({
                "label": label,
                "frameCount": WINDOW_SIZE,
                "frames": [
                    value
                    for frame in window
                    for value in frame
                ]
            })

    output_data = {
        **data,
        "windowSize": WINDOW_SIZE,
        "stride": STRIDE,
        "labels": labels,
        "samples": windowed_samples
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(output_data, file)

    print("Dataset preparation complete.")
    print(f"Original recordings: {len(source_samples)}")
    print(f"Generated windows: {len(windowed_samples)}")
    print(f"Window size: {WINDOW_SIZE} frames")
    print(f"Features per frame: {feature_dim}")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
