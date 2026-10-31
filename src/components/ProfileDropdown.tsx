import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";
import { IconSettings, IconLogout, IconUser } from "../components/icons";
import { cn } from "../lib/cn";
import type { AppView } from "../components/ui/BrutalNav";

interface ProfileDropdownProps {
  onNavigate: (v: AppView) => void;
  onOpenSettings: () => void;
}

/**
 * ProfileDropdown — neobrutalist profile avatar button with dropdown menu.
 *
 * The avatar button sits in the top-right of the home screen. Clicking it
 * opens a compact dropdown panel below it, aligned to the right edge.
 *
 * The panel contains three items:
 *   • Account — navigates to the account page
 *   • Settings — opens the floating settings modal
 *   • Logout   — signs the user out via Firebase
 *
 * Behaviour:
 *   • Click avatar to toggle open/closed
 *   • Click outside, press Escape, or select an item to close
 *   • Stays within the viewport on mobile
 *
 * Design follows the neobrutalist system: thick 3px ink borders, hard offset
 * shadows (no blur), cream paper background, bold accent colours, square
 * corners, snappy pressed states.
 */
export function ProfileDropdown({ onNavigate, onOpenSettings }: ProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const clickedAnchor = anchorRef.current?.contains(e.target as Node);
      const clickedMenu = menuRef.current?.contains(e.target as Node);
      if (!clickedAnchor && !clickedMenu) {
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, close]);

  const handleAccount = useCallback(() => {
    close();
    onNavigate("account");
  }, [close, onNavigate]);

  const handleSettings = useCallback(() => {
    close();
    onOpenSettings();
  }, [close, onOpenSettings]);

  const handleLogout = useCallback(async () => {
    close();
    await signOut();
  }, [close, signOut]);

  return (
    <div className="relative inline-block z-50">
      {/* ── Avatar button ── */}
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User profile menu"
        className={cn(
          "relative inline-flex items-center gap-1",
          // Thick ink border, accent fill, hard shadow — neobrutalist button
          "border-[var(--border-w)] border-[var(--ink)]",
          "bg-[var(--teal)] text-[var(--ink)]",
          "shadow-[var(--shadow)]",
          "rounded-[var(--radius-sm)]",
          // Snappy pressed state: moves toward its shadow
          "transition-[transform,box-shadow] duration-[var(--press-ms)] ease-[var(--ease-snap)]",
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-pressed)]",
          // Visible focus indicator
          "focus:outline-none focus:ring-2 focus:ring-[var(--border-w)] focus:ring-teal",
          "p-1.5"
        )}
      >
        {/* Profile picture or user icon fallback */}
        <span className="flex shrink-0 items-center justify-center h-7 w-7 rounded-[var(--radius-sm)] border-[var(--border-w-thin)] border-[var(--ink)] bg-[var(--paper)] font-[family-name:var(--font-display)] text-[var(--ink)] text-xs font-bold uppercase leading-none">
          {user?.name?.trim().charAt(0).toUpperCase() || "U"}
        </span>
        {/* Downward chevron to indicate clickable dropdown */}
        <span
          className={cn(
            "inline-block ml-0.5 transition-transform duration-[var(--press-ms)] ease-[var(--ease-snap)]",
            open ? "rotate-180" : ""
          )}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -2, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              // Positioned below avatar, aligned right (desktop)
              "absolute right-0 top-full mt-2 w-[220px]",
              // Mobile: keep within viewport, don't overflow
              "max-w-[calc(100vw-1rem)]",
              // Neobrutalist panel styling
              "rounded-[var(--radius)]",
              "border-[var(--border-w)] border-[var(--ink)]",
              "bg-[var(--paper)]",
              "shadow-[var(--shadow-xl)]",
              "z-50"
            )}
          >
            {/* Account row */}
            <button
              type="button"
              onClick={handleAccount}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3",
                "border-b-[var(--border-w-thin)] border-[var(--ink)] bg-transparent",
                "font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-[0.06em]",
                "hover:bg-[var(--sun)] active:bg-[var(--coral)] active:translate-x-[1px]",
                "transition-[background-color,transform] duration-[var(--press-ms)]",
                "focus:outline-none focus:ring-2 focus-ring-[var(--border-w)] focus:ring-teal"
              )}
            >
              <IconUser className="h-5 w-5 shrink-0" aria-hidden />
              <span>Account</span>
            </button>

            {/* Settings row */}
            <button
              type="button"
              onClick={handleSettings}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3",
                "border-b-[var(--border-w-thin)] border-[var(--ink)] bg-transparent",
                "font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-[0.06em]",
                "hover:bg-[var(--sun)] active:bg-[var(--coral)] active:translate-x-[1px]",
                "transition-[background-color,transform] duration-[var(--press-ms)]",
                "focus:outline-none focus:ring-2 focus-ring-[var(--border-w)] focus:ring-teal"
              )}
            >
              <IconSettings className="h-5 w-5 shrink-0" aria-hidden />
              <span>Settings</span>
            </button>

            {/* Logout row — high-contrast yellow/sun background */}
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3",
                "font-[family-name:var(--font-display)] text-sm font-bold text-[var(--ink)] uppercase tracking-[0.06em]",
                "bg-[var(--sun)] hover:bg-[var(--coral)] active:translate-x-[1px]",
                "transition-[background-color,transform] duration-[var(--press-ms)]",
                "focus:outline-none focus:ring-2 focus-ring-[var(--border-w)] focus:ring-teal"
              )}
            >
              <IconLogout className="h-5 w-5 shrink-0" aria-hidden />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
