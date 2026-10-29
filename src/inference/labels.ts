/**
 * The classifier's label vocabulary, in the EXACT order the model's
 * output layer was trained with.
 *
 * Trained on custom 20-word dataset supporting sentences like
 * "I LOVE YOU GRANDMA". Features: 345 per frame (input_shape [null, 16, 345]).
 * Validation accuracy: ~47%.
 */
export const INFERENCE_LABELS: string[] = [
  "A",
  "AGAIN",
  "B",
  "C",
  "CARD",
  "CASH",
  "COIN",
  "D",
  "E",
  "EIGHT",
  "F",
  "FIVE",
  "FOUR",
  "G",
  "GRANDMA",
  "H",
  "I",
  "LOVE",
  "ONE",
  "YOU",
];