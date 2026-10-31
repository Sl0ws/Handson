import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { Wordmark } from "../screens/HomeScreen";
import { IconCamera } from "../components/icons";
import { ProfileDropdown } from "./ProfileDropdown";
import type { AppView } from "../components/ui/BrutalNav";

interface TopNavBarProps {
  view: AppView;
  cameraReady: boolean;
  cameraError?: string | null;
  modelReady: boolean;
  modelError?: string | null;
  tierIndex: number;
  tierLength: number;
  fps?: number | null;
  offline?: boolean;
  onNavigate: (v: AppView) => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
}

/**
 * TopNavBar — floating sticky Neobrutalist top navigation bar.
 *
 * A detached floating panel pinned near the top of the viewport with visible
 * margins on all sides — it never touches the screen edges. Cream background,
 * thick ink border, hard offset shadow, square corners — consistent with the
 * neobrutalist design system.
 *
 *   LEFT   — HandSon brand (Wordmark), clickable → home
 *   CENTER — Camera / Model / Tier status controls + FPS (translate view)
 *   RIGHT  — Profile dropdown (Account / Settings / Logout)
 *
 * Stays visible while scrolling via `position: sticky`. On translate view the
 * center controls stay readable: gaps and padding tighten slightly but text
 * never drops below a comfortable reading size.
 */
export function TopNavBar({
  view,
  cameraReady,
  cameraError,
  modelReady,
  modelError,
  tierIndex,
  tierLength,
  fps,
  offline,
  onNavigate,
  onGoHome,
  onOpenSettings,
}: TopNavBarProps) {
  const isTranslate = view === "translate";

  const controls = useMemo(
    () => [
      {
        id: "camera",
        label: "Camera",
        icon: <IconCamera className="h-4 w-4" aria-hidden />,
        ready: cameraReady,
        error: cameraError,
        onClick: () => onNavigate("translate"),
      },
      {
        id: "model",
        label: "Model",
        ready: modelReady,
        error: modelError,
      },
      {
        id: "tier",
        label: `Tier ${tierIndex + 1}/${tierLength}`,
        ready: true,
      },
    ],
    [cameraReady, cameraError, modelReady, modelError, tierIndex, tierLength, onNavigate]
  );

  return (
    <div
      className={cn(
        // Detached floating container — centered with visible margins
        "sticky z-50 mx-auto",
        "top-[0.75rem] sm:top-[1rem]",
        "max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] lg:max-w-[1200px]"
      )}
    >
      <nav
        aria-label="Top navigation"
        className={cn(
          "flex items-center justify-between",
          // Cream panel with thick ink border
          "border-[var(--border-w)] border-[var(--ink)] bg-[var(--paper)]",
          // Bold hard offset shadow — no blur, no transparency
          "shadow-[4px_4px_0_var(--ink)] sm:shadow-[6px_6px_0_var(--ink)]",
          "rounded-[var(--radius)]",
          // Compact height, balanced padding
          "px-3 py-1.5 sm:px-4 sm:py-2"
        )}
      >
        {/* ── LEFT: Brand ── */}
        <button
          type="button"
          onClick={onGoHome}
          aria-label="HandSon — go home"
          className={cn(
            "flex items-center gap-2",
            "border-[var(--border-w-thin)] border-[var(--ink)]",
            "bg-[var(--paper-raised)] rounded-[var(--radius-sm)]",
            "shadow-[2px_2px_0_var(--ink)]",
            "px-2 py-1 sm:px-3 sm:py-1.5",
            "transition-[transform,box-shadow] duration-[var(--press-ms)] ease-[var(--ease-snap)]",
            "active:translate-x-[1px] active:translate-y-[1px] active:shadow-[var(--shadow-pressed)]",
            "focus:outline-none focus:ring-2 focus-ring-[var(--border-w)] focus:ring-teal"
          )}
        >
          <Wordmark className="text-lg sm:text-xl" />
        </button>

        {/* ── CENTER: Navigation controls ── */}
        <div className={cn(
          "flex items-center",
          isTranslate ? "gap-1 sm:gap-1.5" : "gap-1.5 sm:gap-2",
          "transition-[gap] duration-200 ease-out",
          "flex-1 max-w-[55%] sm:max-w-[60%] justify-center"
        )}>
          {controls.map((ctrl) => {
            const active = ctrl.ready && !ctrl.error;
            return (
              <button
                key={ctrl.id}
                type="button"
                onClick={ctrl.onClick || (() => {})}
                className={cn(
                  "flex items-center gap-1.5 min-w-[fit]",
                  isTranslate ? "px-2.5 py-1 text-xs sm:text-sm" : "px-3 py-1.5 text-sm sm:text-base",
                  "rounded-[var(--radius-sm)] border-[var(--border-w)] border-[var(--ink)]",
                  "font-[family-name:var(--font-display)] font-bold uppercase tracking-[0.06em]",
                  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
                  "hover:-translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)]",
                  "active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--ink)]",
                  "focus:outline-none focus:ring-2 focus-ring-[var(--border-w)] focus:ring-teal",
                  active
                    ? "bg-[var(--lime)] text-[var(--ink)]"
                    : ctrl.error
                    ? "bg-[var(--coral)]/10 text-[var(--coral)] border-[var(--coral)]"
                    : "bg-[var(--paper-sunken)] text-[var(--ink-soft)] border-[var(--ink)]/50"
                )}
                title={ctrl.error ?? undefined}
              >
                {ctrl.icon && (
                  <span className={cn("shrink-0", isTranslate ? "h-3 w-3" : "h-4 w-4")}>
                    {ctrl.icon}
                  </span>
                )}
                <span className={cn("whitespace-nowrap", isTranslate ? "text-xs sm:text-sm" : "text-sm sm:text-base")}>
                  {ctrl.label}
                </span>
                {active ? (
                  <span className={cn("size-1 rounded-full bg-[var(--sun)]", isTranslate ? "size-[7px]" : "size-1")} aria-hidden />
                ) : ctrl.error ? (
                  <span className={cn("size-1 rounded-full bg-[var(--coral)]", isTranslate ? "size-[7px]" : "size-1")} aria-hidden />
                ) : null}
              </button>
            );
          })}
          {isTranslate && fps ? (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "ml-1 border-l-[var(--border-w)] border-[var(--ink)] pl-2 sm:pl-3 pr-2 sm:pr-3",
                isTranslate ? "px-3 py-1.5 text-sm sm:text-base" : "px-3 py-1.5 text-sm sm:text-base"
              )}
            >
              <span className={cn("size-1 rounded-full bg-[var(--ink)]", isTranslate ? "size-[7px]" : "size-1")} aria-hidden />
              <span className={cn("text-[var(--ink)]", isTranslate ? "text-xs sm:text-sm" : "text-sm sm:text-base")}>
                {Math.round(fps)} fps
              </span>
            </motion.span>
          ) : null}
          {offline ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "ml-1 border-l-[var(--border-w)] border-[var(--ink)] pl-2 sm:pl-3 pr-2 sm:pr-3",
                isTranslate ? "px-3 py-1.5 text-sm sm:text-base" : "px-3 py-1.5 text-sm sm:text-base"
              )}
            >
              <span className={cn("size-1 rounded-full bg-[var(--coral)]", isTranslate ? "size-[7px]" : "size-1")} aria-hidden />
              <span className={cn("text-[var(--coral)]", isTranslate ? "text-xs sm:text-sm" : "text-sm sm:text-base")}>
                Offline
              </span>
            </motion.span>
          ) : null}
        </div>

        {/* ── RIGHT: Profile Dropdown ── */}
        <ProfileDropdown
          onNavigate={onNavigate}
          onOpenSettings={onOpenSettings}
        />
      </nav>
    </div>
  );
}
