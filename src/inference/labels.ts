/**
 * The classifier's label vocabulary, in the EXACT order the model's
 * output layer was trained with.
 *
 * Order is a contract: index i of a prediction vector is this list's
 * i-th label. Must match label_map.json produced by training.
 */
export const INFERENCE_LABELS: string[] = ["I", "LOVE", "YOU", "GRANDMA"];