import { BrutalLabel } from "./ui/BrutalLabel";

interface Props {
  textSize: "sm" | "base" | "lg";
  onTextSize: (size: "sm" | "base" | "lg") => void;
  highContrast: boolean;
  onHighContrast: (on: boolean) => void;
  lowPowerMode: boolean;
  onLowPowerMode: (on: boolean) => void;
  darkMode: boolean;
  onDarkMode: (on: boolean) => void;
}

const SIZES: { id: "sm" | "base" | "lg"; label: string; glyph: string }[] = [
  { id: "sm", label: "Small", glyph: "A" },
  { id: "base", label: "Default", glyph: "Aa" },
  { id: "lg", label: "Large", glyph: "Aaa" },
];

const tab =
  "flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-sm)] " +
  "border-[var(--border-w)] border-[var(--ink)] " +
  "font-[family-name:var(--font-display)] uppercase tracking-[0.08em] " +
  "shadow-[var(--shadow-lg)] " +
  "transition-[transform,box-shadow,background-color] duration-[var(--press-ms)] ease-[var(--ease-snap)] " +
  "hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)] " +
  "active:translate-x-[1px] active:translate-y-[1px] active:shadow-[var(--shadow-pressed)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/**
 * Accessibility controls as a floating left tab.
 *
 * Fixed to the left edge so it is always reachable regardless of scroll
 * position. A compact tab shows the active state at a glance; hovering
 * reveals the full control panel with bigger, higher-contrast text.
 *
 * State is never colour-only: active states carry a filled block, a hard
 * ink border, AND a printed label.
 */
export function AccessibilityControls({ textSize, onTextSize, highContrast, onHighContrast, lowPowerMode, onLowPowerMode, darkMode, onDarkMode }: Props) {

  return (
    <section
      aria-label="Accessibility settings"
      className="fixed left-0 top-[12rem] z-50 flex flex-col gap-1"
    >
      {/* Expand/collapse tab — always visible, large touch target. */}
      <button
        onClick={() => {}}
        className={`${tab} bg-[var(--ink)] text-[var(--paper)] text-xs font-extrabold`}
        aria-label="Accessibility settings"
        aria-expanded="true"
      >
        <span className="rotate-90">⚙</span>
        <span>Settings</span>
      </button>

      {/* Control panel — bigger letters, high contrast, stacked vertically. */}
      <div className="mt-2 border-[var(--border-w)] border-[var(--ink)] bg-[var(--paper-raised)] p-3 shadow-[var(--shadow-xl)]">
        <BrutalLabel slashed tone="mute" className="text-xs font-extrabold uppercase tracking-[0.16em] mb-2 block">
          Display
        </BrutalLabel>

        {/* Text size — big glyphs, explicit labels. */}
        <div className="flex flex-col gap-1" role="group" aria-label="Text size">
          {SIZES.map(({ id, label, glyph }) => {
            const active = textSize === id;
            return (
              <button
                key={id}
                onClick={() => onTextSize(id)}
                className={`flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] px-2 py-1.5 ${
                  active ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--lime)]"
                } text-base font-bold`}
                aria-pressed={active}
                aria-label={label}
              >
                <span className={active ? "" : "font-extrabold"}>{glyph}</span>
                <span className="text-[var(--ink)]">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t-[var(--border-w-thin)] border-[var(--ink)]">
          <button
            onClick={() => onHighContrast(!highContrast)}
            className={`flex items-center gap-2 w-full rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] px-2 py-1.5 ${
              highContrast ? "bg-[var(--sun)] text-[var(--ink)]" : "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--lime)]"
            } text-base font-bold`}
            aria-pressed={highContrast}
          >
            <span className="size-3 border-[var(--border-w-thin)] border-[var(--ink)] bg-current" aria-hidden="true" />
            <span className="text-[var(--ink)] font-bold">Contrast: {highContrast ? "High" : "Normal"}</span>
          </button>
        </div>

        <div className="mt-2 pt-2 border-t-[var(--border-w-thin)] border-[var(--ink)]">
          <button
            onClick={() => onLowPowerMode(!lowPowerMode)}
            className={`flex items-center gap-2 w-full rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] px-2 py-1.5 ${
              lowPowerMode ? "bg-[var(--sun)] text-[var(--ink)]" : "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--coral)]"
            } text-base font-bold`}
            aria-pressed={lowPowerMode}
          >
            <span className="size-3 border-[var(--border-w-thin)] border-[var(--ink)] bg-current" aria-hidden="true" />
            <span className="text-[var(--ink)] font-bold">Low power: {lowPowerMode ? "On" : "Off"}</span>
          </button>
        </div>

        <div className="mt-2 pt-2 border-t-[var(--border-w-thin)] border-[var(--ink)]">
          <button
            onClick={() => onDarkMode(!darkMode)}
            className={`flex items-center gap-2 w-full rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] px-2 py-1.5 ${
              darkMode ? "bg-[var(--sun)] text-[var(--ink)]" : "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--teal)]"
            } text-base font-bold`}
            aria-pressed={darkMode}
          >
            <span className="size-3 border-[var(--border-w-thin)] border-[var(--ink)] bg-current" aria-hidden="true" />
            <span className="text-[var(--ink)] font-bold">Dark mode: {darkMode ? "On" : "Off"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
