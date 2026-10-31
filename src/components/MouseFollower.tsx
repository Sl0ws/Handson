import { useRef } from "react";
import { usePointerIntent, prefersReducedMotion } from "../lib/usePointerIntent";

/**
 * MouseFollower — decorative sparkles that trail the pointer.
 *
 * Only rendered when `enabled` is true (i.e. NOT low power mode) and the user
 * hasn't requested reduced motion. Uses the same `usePointerIntent` hook as
 * the mascots: writes `--mx`/`--my` (unitless, clamped to [-1, 1]) to a
 * full-screen host element, so zero React re-renders happen after mount —
 * the compositor moves the dots directly.
 *
 * On low-end devices the parent passes `enabled={false}`, which unmounts the
 * dots and removes the pointer listeners entirely.
 */
export function MouseFollower({ enabled }: { enabled: boolean }) {
  const host = useRef<HTMLDivElement | null>(null);

  usePointerIntent(host, { ease: 0.15, epsilon: 0.005 });

  if (!enabled || prefersReducedMotion()) return null;

  return (
    <div
      ref={host}
      className="fixed inset-0 pointer-events-none z-[60]"
      aria-hidden="true"
    >
      {/* Five dots at different sizes and travel distances for a clear trailing effect. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="fixed pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform:
              "translate(-50%, -50%) " +
              `translate(calc(var(--mx, 0) * ${20 + i * 16}px), calc(var(--my, 0) * ${20 + i * 16}px))`,
            transition: "transform 100ms linear",
          }}
        >
          <div
            className={`w-4 h-4 rounded-full shadow-[var(--shadow)] border-[var(--border-w-thin)] border-[var(--ink)] ${
              i === 0 ? "bg-[var(--sun)]" :
              i === 1 ? "bg-[var(--teal)]" :
              i === 2 ? "bg-[var(--coral)]" :
              i === 3 ? "bg-[var(--lime)]" :
              "bg-[var(--purple)]"
            } animate-pulse`}
          />
        </div>
      ))}
    </div>
  );
}
