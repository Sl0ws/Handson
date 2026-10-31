import { useCallback, useRef, useState } from "react";
import type { Prediction } from "../inference/useSignInference";
import { glossToEnglish } from "./grammarParser";

// Committing a word into a sentence is a stronger claim than just showing
// a live label, so this is intentionally higher than PredictionOverlay's
// 0.6 display threshold.
const COMMIT_CONFIDENCE_THRESHOLD = 0.7;
// Require the same label across this many consecutive predictions before
// committing it — predictions arrive roughly every stride (~250ms at
// 24fps/stride 6), so 2 in a row is ~500ms of holding the sign, enough to
// filter out a single spurious misclassified window without adding much
// perceived lag.
const MIN_STABLE_PREDICTIONS = 2;
// How long hands can be absent from frame before the in-progress sentence
// is considered finished and gets finalized.
const SENTENCE_END_IDLE_MS = 1800;
const MAX_FINALIZED_SENTENCES = 5;
// Threshold (ms) between consecutive predictions to classify as "fast"
// signing. Below this = rapid-fire signing; above = deliberate slow signing.
const FAST_SIGNING_MAX_INTERVAL_MS = 350;
// How many recent intervals to sample for the speed estimate.
const SPEED_SAMPLE_WINDOW = 6;
// When signing fast, commit after this many predictions instead of waiting
// for stability — the mode-correction pass at finalize time cleans up noise.
const FAST_COMMIT_MIN_PREDICTIONS = 1;

/**
 * Sentence-mode layer on top of the isolated-sign classifier from
 * useSignInference. This is NOT continuous sign language recognition — a
 * true CTC-style sequence model trained on unsegmented sentence video would
 * be needed for that, and no public FSL dataset currently supports training
 * one. What this does instead: watch the existing per-window predictions for
 * a sign held stably above a confidence threshold, commit it as one "word"
 * once seen consistently, and use hands leaving the frame (a natural pause
 * between signs, or lowering hands at the end of a sentence) as the boundary
 * signal for when a sentence is done.
 *
 * Grammar behaviour depends on signing speed:
 *   - SLOW signing (deliberate pauses between words): each word is committed
 *     only when it holds stably above confidence threshold — highest-accuracy
 *     mode, one sign at a time.
 *   - FAST signing (rapid-fire predictions, < ~350ms between them): words are
 *     committed more aggressively, and at finalize time the sentence is run
 *     through a mode-correction pass — the most frequent word in a cluster
 *     replaces its neighbours, cleaning up misclassified blips.
 *
 * When a sentence is finalised the raw gloss sequence is passed through the
 * FSL grammar layer (grammarParser.ts) which canonicalises spelling, applies
 * contextual disambiguation, and re-orders Topic-Comment glosses into
 * grammatical English. The hook exposes both the raw gloss sentence and the
 * translated English so the UI can show either.
 *
 * Two separate entry points, called from two different places in
 * App.tsx's capture loop:
 *   onPrediction — call only when a genuinely NEW model prediction
 *     arrives (not every frame), drives the word-commit logic.
 *   onActivity — call every captured frame regardless of whether a new
 *     prediction arrived, drives the idle-based sentence-end check.
 */
export function useSentenceBuilder() {
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentEnglish, setCurrentEnglish] = useState<string>("");
  const [finalizedSentences, setFinalizedSentences] = useState<string[]>([]);
  const [finalizedEnglish, setFinalizedEnglish] = useState<string[]>([]);

  const currentWordsRef = useRef<string[]>([]);
  const pendingLabelRef = useRef<string | null>(null);
  const pendingStableCountRef = useRef(0);
  const lastCommittedLabelRef = useRef<string | null>(null);
  const lastActivityMsRef = useRef(0);
  const wasHandsPresentRef = useRef(false);

  // Speed detection: intervals between predictions.
  const lastPredictionTimeRef = useRef<number | null>(null);
  const predictionIntervalsRef = useRef<number[]>([]);
  const signingSpeedRef = useRef<"fast" | "slow">("slow");

  // Derive the English translation of the in-progress sentence whenever the
  // raw gloss list changes. This is NOT finalised — the grammar layer is
  // deliberately re-run on the live token list so the user sees the
  // translation update as they sign, not only when the sentence ends.
  const refreshCurrentEnglish = useCallback((words: string[]) => {
    if (words.length === 0) {
      setCurrentEnglish("");
      return;
    }
    const { english } = glossToEnglish(words);
    setCurrentEnglish(english);
  }, []);

  /** Estimate signing speed from recent prediction intervals. */
  const estimateSigningSpeed = useCallback(() => {
    const intervals = predictionIntervalsRef.current;
    if (intervals.length < 2) return "slow";
    const recent = intervals.slice(-SPEED_SAMPLE_WINDOW);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    return avg < FAST_SIGNING_MAX_INTERVAL_MS ? "fast" : "slow";
  }, []);

  /** Mode-correction pass for fast signing: replace each word with the most
   *  frequent word in its local window, cleaning up rapid-fire misclassifications.
   *  Slow signing passes through unchanged. */
  const applyGrammarCorrection = useCallback(
    (words: string[]): string[] => {
      if (signingSpeedRef.current !== "fast" || words.length < 3) return words;
      const out = words.slice();
      const window = 2; // look at +/- 2 neighbours
      for (let i = 0; i < out.length; i++) {
        const lo = Math.max(0, i - window);
        const hi = Math.min(out.length, i + window + 1);
        const local = out.slice(lo, hi);
        const counts: Record<string, number> = {};
        for (const w of local) counts[w] = (counts[w] ?? 0) + 1;
        let mode = local[0];
        let modeCount = 0;
        for (const [w, c] of Object.entries(counts)) {
          if (c > modeCount) {
            mode = w;
            modeCount = c;
          }
        }
        out[i] = mode;
      }
      return out;
    },
    []
  );

  const finalizeSentence = useCallback(() => {
    if (currentWordsRef.current.length === 0) return;
    // Apply fast-signing grammar correction before sending to the grammar layer.
    const correctedWords = applyGrammarCorrection(currentWordsRef.current);
    const glossSentence = correctedWords.join(" ");
    const { english, trace } = glossToEnglish(correctedWords);
    currentWordsRef.current = [];
    setCurrentWords([]);
    setCurrentEnglish("");
    setFinalizedSentences((prev) => [glossSentence, ...prev].slice(0, MAX_FINALIZED_SENTENCES));
    setFinalizedEnglish((prev) => [english, ...prev].slice(0, MAX_FINALIZED_SENTENCES));
    if (trace.length > 0) {
      console.log("[grammar]", trace.join(" | "));
    }
    lastCommittedLabelRef.current = null;
  }, [applyGrammarCorrection]);

  const onPrediction = useCallback((prediction: Prediction, timestampMs: number) => {
    // Track signing speed from prediction intervals.
    if (lastPredictionTimeRef.current !== null) {
      const interval = timestampMs - lastPredictionTimeRef.current;
      predictionIntervalsRef.current.push(interval);
      if (predictionIntervalsRef.current.length > SPEED_SAMPLE_WINDOW * 2) {
        predictionIntervalsRef.current = predictionIntervalsRef.current.slice(-SPEED_SAMPLE_WINDOW);
      }
      signingSpeedRef.current = estimateSigningSpeed();
    }
    lastPredictionTimeRef.current = timestampMs;

    if (prediction.confidence < COMMIT_CONFIDENCE_THRESHOLD) {
      pendingLabelRef.current = null;
      pendingStableCountRef.current = 0;
      return;
    }

    const isFast = signingSpeedRef.current === "fast";

    if (prediction.label === pendingLabelRef.current) {
      pendingStableCountRef.current += 1;
    } else {
      pendingLabelRef.current = prediction.label;
      pendingStableCountRef.current = 1;
    }

    const minStable = isFast ? FAST_COMMIT_MIN_PREDICTIONS : MIN_STABLE_PREDICTIONS;
    const isStable = pendingStableCountRef.current >= minStable;
    // Guards against one held sign spamming the sentence with repeated
    // commits every time it re-crosses the stability count.
    const isNewWord = prediction.label !== lastCommittedLabelRef.current;

    if (isStable && isNewWord) {
      currentWordsRef.current = [...currentWordsRef.current, prediction.label];
      setCurrentWords(currentWordsRef.current);
      refreshCurrentEnglish(currentWordsRef.current);
      lastCommittedLabelRef.current = prediction.label;
      lastActivityMsRef.current = timestampMs;
    }
  }, [refreshCurrentEnglish, estimateSigningSpeed, FAST_COMMIT_MIN_PREDICTIONS, MIN_STABLE_PREDICTIONS]);

  const onActivity = useCallback(
    (handsPresent: boolean, timestampMs: number) => {
      // Hands re-entering frame after being away is a natural "new
      // gesture" boundary — clears the repeat-guard so the same word can
      // be signed again if that's genuinely what happens next.
      if (handsPresent && !wasHandsPresentRef.current) {
        lastCommittedLabelRef.current = null;
      }
      wasHandsPresentRef.current = handsPresent;

      if (handsPresent) {
        lastActivityMsRef.current = timestampMs;
      } else if (
        currentWordsRef.current.length > 0 &&
        timestampMs - lastActivityMsRef.current > SENTENCE_END_IDLE_MS
      ) {
        finalizeSentence();
      }
    },
    [finalizeSentence]
  );

  const clear = useCallback(() => {
    currentWordsRef.current = [];
    setCurrentWords([]);
    setCurrentEnglish("");
    setFinalizedSentences([]);
    setFinalizedEnglish([]);
    pendingLabelRef.current = null;
    pendingStableCountRef.current = 0;
    lastCommittedLabelRef.current = null;
    lastPredictionTimeRef.current = null;
    predictionIntervalsRef.current = [];
    signingSpeedRef.current = "slow";
  }, []);

  return {
    currentWords,
    currentEnglish,
    finalizedSentences,
    finalizedEnglish,
    onPrediction,
    onActivity,
    clear,
    endSentenceNow: finalizeSentence,
  };
}
