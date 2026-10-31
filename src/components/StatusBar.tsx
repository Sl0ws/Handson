import { Tooltip } from "./Tooltip";
import { motion } from "framer-motion";

interface Item {
  label: string;
  ready: boolean;
  error?: string | null;
  tooltip?: string;
}

interface Props {
  items: Item[];
  fps?: number | null;
  offline?: boolean;
}

/**
 * A vertical status rail pinned to the left edge of the viewport.
 *
 * One pill per subsystem (camera, model) plus the live fps counter.
 * Each pill is green when ready, amber when loading, red when errored —
 * so a teacher can tell at a glance whether the pipeline is healthy
 * without opening the console.
 *
 * The rail is `sticky top-0` so it follows the user as they scroll —
 * it never disappears below the fold. Items stack vertically instead of
 * horizontally, which reads better in a narrow left column and keeps
 * every label fully visible rather than crammed into a horizontal bar.
 *
 * `offline` is set from the browser's native `offline`/`online`
 * events (mirrored by the service worker's `offline-change` custom
 * event in main.tsx) so the banner appears automatically when the
 * network drops (the app still works from cache, since the model and WASM are cached).
 */
export function StatusBar({ items, fps, offline }: Props) {
  return (
    <>
      {offline && (
        <motion.div
          className="offline-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          Offline — running from cache
        </motion.div>
      )}
      <motion.div
        className="status-rail"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Brand block at the top of the rail. */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2.5 border-b-[var(--border-w-thin)] border-[var(--ink)] bg-[var(--paper-raised)]"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <span
            className="size-2.5 rounded-full bg-[var(--teal)] shadow-[0_0_10px_rgba(34,240,224,0.6)]"
            aria-hidden="true"
          />
          <span className="text-sm font-bold tracking-tight text-[var(--ink)] leading-tight">
            HandSon
          </span>
        </motion.div>

        {/* Status items stacked vertically. */}
        <div className="flex flex-col gap-1 px-2 py-2">
          {items.map((it, i) => (
            <motion.span
              key={it.label}
              className={`glass-pill w-full justify-start ${
                it.error
                  ? "border-[var(--coral)] bg-[var(--coral)]/10 text-[var(--coral)]"
                  : it.ready
                  ? "border-[var(--lime)] bg-[var(--lime)]/10 text-[var(--teal-deep)]"
                  : "border-[var(--sun)] bg-[var(--sun)]/10 text-[var(--ink-soft)]"
              }`}
              title={it.error ?? undefined}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
            >
              <span
                className={`size-1.5 rounded-full ${
                  it.error
                    ? "bg-[var(--coral)]"
                    : it.ready
                    ? "animate-pulse bg-[var(--lime)]"
                    : "animate-pulse bg-[var(--sun)]"
                } mr-2`}
                aria-hidden="true"
              />
              {it.tooltip ? (
                <Tooltip text={it.tooltip}>{it.label}</Tooltip>
              ) : (
                <span className="text-xs font-bold text-[var(--ink)]">{it.label}</span>
              )}
            </motion.span>
          ))}
          {fps ? (
            <motion.span
              className="glass-pill w-full justify-start text-[var(--ink)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <span className="size-1.5 rounded-full bg-[var(--ink)] mr-2" aria-hidden="true" />
              <span className="text-xs font-bold">{fps} fps</span>
            </motion.span>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
