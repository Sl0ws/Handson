import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type { NormalizedLandmark };

// Packed layout, all in a single Float32Array-backed ArrayBuffer:
// [0      .. 99)   pose:       33 points * 3 (x,y,z)
// [99     .. 162)  leftHand:   21 points * 3
// [162    .. 225)  rightHand:  21 points * 3
// [225    .. 1629) face:       468 points * 3
export const POSE_COUNT = 33;
export const HAND_COUNT = 21;
export const FACE_COUNT = 468;
export const POSE_OFFSET = 0;
export const LEFT_HAND_OFFSET = POSE_OFFSET + POSE_COUNT * 3;
export const RIGHT_HAND_OFFSET = LEFT_HAND_OFFSET + HAND_COUNT * 3;
export const FACE_OFFSET = RIGHT_HAND_OFFSET + HAND_COUNT * 3;
export const TOTAL_FLOATS = FACE_OFFSET + FACE_COUNT * 3;

// Lip landmark indices for feature extraction (mirrored from training/extract_landmarks.py)
export const LIP_LANDMARK_INDICES: number[] = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375,
  291, 308, 324, 318, 402, 317,
  14, 87, 178, 88, 95, 185, 40, 39, 37, 0,
  267, 269, 270, 409, 415, 310, 311, 312, 13, 82,
  81, 42, 183, 78,
];

export interface LandmarksResult {
  timestamp: number;
  buffer: ArrayBuffer;
  hasPose: boolean;
  hasLeftHand: boolean;
  hasRightHand: boolean;
  hasFace: boolean;
}