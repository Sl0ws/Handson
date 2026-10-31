import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSettings } from "../components/icons";
import { cn } from "../lib/cn";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  { id: "base", label: "Normal", glyph: "Aa" },
  { id: "lg", label: "Large", glyph: "Aaa" },
];

/**
 * SettingsModal — floating neobrutalist settings panel.
 *
 * Opens when Settings is selected from the profile dropdown. Contains all
 * app-wide preference controls in one place:
 *   • Display / Text Size (Small / Normal / Large)
 *   • Accessibility / Contrast (Normal / High)
 *   • Performance / Low Power Mode (On / Off)
 *   • Appearance / Dark Mode (On / Off)
 *
 * Closes via the close button, Escape, or clicking outside.
 */
export function SettingsModal({
  isOpen,
  onClose,
  textSize,
  onTextSize,
  highContrast,
  onHighContrast,
  lowPowerMode,
  onLowPowerMode,
  darkMode,
  onDarkMode,
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => onClose(), [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen, close]);

  const sizeButtonClass = (active: boolean) =>
    cn(
      "flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] px-3 py-2",
      active
        ? "bg-[var(--ink)] text-[var(--paper)]"
        : "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--lime)]"
    );

  const toggleButtonClass = (active: boolean, hoverTone: "lime" | "coral" | "teal") =>
    cn(
      "flex items-center gap-3 w-full rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] px-3 py-2 font-bold text-[var(--ink)]",
      active
        ? "bg-[var(--sun)] text-[var(--ink)]"
        : `bg-[var(--paper-sunken)] hover:bg-[var(--${hoverTone})]`
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-49 bg-[var(--ink)]/20"
            onClick={close}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "w-full max-w-[360px]",
              "max-w-[calc(100vw-2rem)]",
              "rounded-[var(--radius)]",
              "border-[var(--border-w)] border-[var(--ink)]",
              "bg-[var(--paper)]",
              "shadow-[var(--shadow-xl)]",
              "p-0"
            )}
          >
            <div className="flex items-center justify-between border-b-[var(--border-w)] border-[var(--ink)] bg-[var(--paper-raised)] px-4 py-3 rounded-t-[var(--radius)]">
              <div className="flex items-center gap-2">
                <IconSettings className="h-5 w-5 shrink-0" aria-hidden />
                <span className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)] uppercase tracking-tight">
                  Settings
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close settings"
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] bg-[var(--paper-sunken)] text-[var(--ink)]",
                  "hover:bg-[var(--sun)] active:bg-[var(--coral)] active:translate-x-[1px] active:translate-y-[1px]",
                  "transition-[background-color,transform] duration-[var(--press-ms)]",
                  "focus:outline-none focus:ring-2 focus-ring-[var(--border-w)] focus:ring-teal"
                )}
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <section className="space-y-2">
                <div className="flex items-center gap-2 border-b-[var(--border-w-thin)] border-[var(--ink)] pb-1">
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-tight">
                    Display
                  </span>
                </div>
                <div className="flex flex-col gap-1" role="group" aria-label="Text size">
                  {SIZES.map(({ id, label, glyph }) => {
                    const active = textSize === id;
                    return (
                      <button
                        key={id}
                        onClick={() => onTextSize(id)}
                        className={sizeButtonClass(active)}
                        aria-pressed={active}
                        aria-label={`Text size: ${label}`}
                      >
                        <span className="font-extrabold">{glyph}</span>
                        <span className="text-[var(--ink)] font-bold">{label}</span>
                        {active && (
                          <span className="h-3 w-3 rounded-[var(--radius-sm)] bg-[var(--sun)] border-[var(--border-w-thin)] border-[var(--ink)]" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 border-b-[var(--border-w-thin)] border-[var(--ink)] pb-1">
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-tight">
                    Contrast
                  </span>
                </div>
                <button
                  onClick={() => onHighContrast(!highContrast)}
                  className={toggleButtonClass(highContrast, "lime")}
                  aria-pressed={highContrast}
                >
                  <span className="size-3 border-[var(--border-w-thin)] border-[var(--ink)] bg-current shrink-0" aria-hidden />
                  <span className="text-[var(--ink)] font-bold">
                    {highContrast ? "High" : "Normal"}
                  </span>
                </button>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 border-b-[var(--border-w-thin)] border-[var(--ink)] pb-1">
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-tight">
                    Low Power Mode
                  </span>
                </div>
                <button
                  onClick={() => onLowPowerMode(!lowPowerMode)}
                  className={toggleButtonClass(lowPowerMode, "coral")}
                  aria-pressed={lowPowerMode}
                >
                  <span className="size-3 border-[var(--border-w-thin)] border-[var(--ink)] bg-current shrink-0" aria-hidden />
                  <span className="text-[var(--ink)] font-bold">
                    {lowPowerMode ? "On" : "Off"}
                  </span>
                </button>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 border-b-[var(--border-w-thin)] border-[var(--ink)] pb-1">
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-tight">
                    Dark Mode
                  </span>
                </div>
                <button
                  onClick={() => onDarkMode(!darkMode)}
                  className={toggleButtonClass(darkMode, "teal")}
                  aria-pressed={darkMode}
                >
                  <span className="size-3 border-[var(--border-w-thin)] border-[var(--ink)] bg-current shrink-0" aria-hidden />
                  <span className="text-[var(--ink)] font-bold">
                    {darkMode ? "On" : "Off"}
                  </span>
                </button>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
