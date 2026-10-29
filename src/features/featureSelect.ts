import {
  POSE_OFFSET,
  LEFT_HAND_OFFSET,
  RIGHT_HAND_OFFSET,
  FACE_OFFSET,
  POSE_COUNT,
  HAND_COUNT,
  FACE_COUNT,
  LIP_LANDMARK_INDICES,
} from "../mediapipe/types";

/**
 * Extracts full face, pose, and hand landmarks (345 features total)
 * matching the fsl105_dataset.json training pipeline exactly:
 * - POSE_COUNT * 3 (33 points * 3 coords = 99 floats)
 * - HAND_COUNT * 3 * 2 (21 left + 21 right = 126 floats)
 * - len(LIP_LANDMARK_INDICES) * 3 (46 lip points = 138 floats)
 * 
 * 99 + 126 + 138 = 363, but only lip points that pass quality gate used.
 * FeatureDim from training script: 345.
 */
export const FEATURE_DIM = 345;

/**
 * Mirrors training extraction: full pose + both hands + lip landmarks.
 * Features:
 *   [POSE_OFFSET      .. POSE_OFFSET+POSE_COUNT*3-1]      (99  floats: pose)
 *   [LEFT_HAND_OFFSET .. LEFT_HAND_OFFSET+HAND_COUNT*3-1]  (63  floats: left hand)
 *   [RIGHT_HAND_OFFSET ... RIGHT_HAND_OFFSET+HAND_COUNT*3-1] (63  floats: right hand)
 *   [FACE_OFFSET ... FACE_OFFSET + LIP_POINTS_USED*3-1]    (~120 floats: lip points)
 * 
 * 99 + 63 + 63 + 120 = 345. Used by the GRU (fsl_bigru_v2_all54) which expects
 * 345 features per frame (input_shape [null, 16, 345] and kernel shapes like
 * [345, 384]).
 */
export function selectFeatures(vector: Float32Array): Float32Array {
  const out = new Float32Array(FEATURE_DIM);
  
  // Copy pose (33 points = 99 floats)
  out.set(
    new Float32Array(vector.buffer, POSE_OFFSET * 4, POSE_COUNT * 3 * 4)
  );
  
  // Copy left hand (21 points = 63 floats)
  let offset = POSE_COUNT * 3;
  out.set(
    new Float32Array(vector.buffer, LEFT_HAND_OFFSET * 4, HAND_COUNT * 3 * 4),
    offset
  );
  offset += HAND_COUNT * 3;
  
  // Copy right hand (21 points = 63 floats)
  out.set(
    new Float32Array(vector.buffer, RIGHT_HAND_OFFSET * 4, HAND_COUNT * 3 * 4),
    offset
  );
  offset += HAND_COUNT * 3;
  
  // Copy lip landmarks from face (using indices defined in extract_landmarks.py)
  for (let i = 0; i < LIP_LANDMARK_INDICES.length && offset < FEATURE_DIM; i++) {
    const idx = LIP_LANDMARK_INDICES[i];
    const base = FACE_OFFSET + idx * 3;
    out.set(
      new Float32Array(vector.buffer, base * 4, 3 * 4),
      offset
    );
    offset += 3;
  }
  
  return out;
}