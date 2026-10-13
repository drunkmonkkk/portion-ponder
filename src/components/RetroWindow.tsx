import { useEffect, useRef, useState } from "react";
import { motion, useDragControls, useMotionValue } from "motion/react";
import { Minus, Square, X, Sparkles } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import type { WindowState } from "../hooks/useWindowManager";
export function RetroWindow({
  state,
  boundsRef,
  title,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}: {
  state: WindowState;
  boundsRef: RefObject<HTMLDivElement | null>;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}) {
  const controls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(window.innerWidth < 760);
  useEffect(() => {
    const onResize = () => {
      setMobile(window.innerWidth < 760);
      x.set(0);
      y.set(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [x, y]);
  const game = state.id === "game";
  useEffect(() => {
    if (!state.minimized && !game) ref.current?.focus({ preventScroll: true });
  }, [state.minimized, game]);
  useEffect(() => {
    if (state.maximized || mobile) {
      x.set(0);
      y.set(0);
    }
  }, [state.maximized, mobile, x, y]);
  return (
    <motion.section
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-label={title}
      className={`retro-window ${game ? "game-window" : "aux-window"} ${state.maximized ? "maximized" : ""} ${state.id}-window`}
      style={{
        zIndex: state.z + 10,
        x,
        y,
        display: state.minimized ? "none" : undefined,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.18 }}
      drag={!mobile && !state.maximized}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={boundsRef}
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
    >
      <header
        className="window-title"
        onPointerDown={(e) => {
          if (
            !(e.target as HTMLElement).closest("button") &&
            !mobile &&
            !state.maximized
          )
            controls.start(e);
        }}
      >
        <span className="window-title-name">
          <Sparkles size={15} />
          {title}
        </span>
        <div className="window-controls">
          <button aria-label={`Minimize ${title}`} onClick={onMinimize}>
            <Minus size={14} />
          </button>
          <button aria-label={`Maximize ${title}`} onClick={onMaximize}>
            <Square size={11} />
          </button>
          <button aria-label={`Close ${title}`} onClick={onClose}>
            <X size={14} />
          </button>
        </div>
      </header>
      <div className="window-content">{children}</div>
    </motion.section>
  );
}
