import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClose) onClose();
        if (e.key === "Tab") {
          const buttons = ref.current?.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled), [tabindex="0"]',
          );
          if (!buttons?.length) return;
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal retro-window"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <header className="window-title">
          <span>{title}</span>
          {onClose && (
            <button
              className="mini-button"
              aria-label={`Close ${title}`}
              onClick={onClose}
            >
              <X size={15} />
            </button>
          )}
        </header>
        <div className="modal-body">{children}</div>
      </motion.div>
    </div>
  );
}
