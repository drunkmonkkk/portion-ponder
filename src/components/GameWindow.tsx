import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  MousePointer2,
  RotateCcw,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { byId } from "../data/potions";
import { PotionBottle } from "./PotionBottle";
import { SWAP_DURATION } from "../hooks/useGame";
import type { useGame } from "../hooks/useGame";
import type { AppId } from "./DesktopIcon";
import { twoStarLimit } from "../utils/puzzleLogic";
export type GameController = ReturnType<typeof useGame>;
export function GameWindow({
  game,
  open,
  inspect,
  tutorialDone,
  finishTutorial,
  onReset,
  onNext,
}: {
  game: GameController;
  open: (id: AppId) => void;
  inspect: (id: string) => void;
  tutorialDone: boolean;
  finishTutorial: () => void;
  onReset: () => void;
  onNext: () => void;
}) {
  const { state, level } = game;
  const [menu, setMenu] = useState<string | null>(null);
  const [allHistory, setAllHistory] = useState(false);
  const count = state.correct;
  const total = state.arrangement.length;
  const menus: Record<string, { label: string; action: () => void }[]> = {
    File: [
      { label: "Restart shelf", action: onReset },
      { label: "Preferences…", action: () => open("settings") },
    ],
    Bottles: [{ label: "Open Bottlepedia", action: () => open("pedia") }],
    Levels: [{ label: "Open Level Archive", action: () => open("archive") }],
    Help: [{ label: "How to Play.txt", action: () => open("help") }],
  };
  const history = [
    ...(allHistory ? state.history : state.history.slice(-6)),
  ].reverse();
  return (
    <>
      <nav className="menu-bar" aria-label="Application menu">
        {Object.keys(menus).map((name) => (
          <div className="menu-holder" key={name}>
            <button
              className={menu === name ? "active" : ""}
              aria-expanded={menu === name}
              onClick={() => setMenu(menu === name ? null : name)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenu(null);
              }}
            >
              {name}
            </button>
            {menu === name && (
              <>
                <button
                  className="menu-dismiss"
                  aria-label="Dismiss menu"
                  tabIndex={-1}
                  onClick={() => setMenu(null)}
                />
                <div className="dropdown">
                  {menus[name].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setMenu(null);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
        <span className="menu-right">
          a little pop of possibility <Sparkles size={12} />
        </span>
      </nav>
      <div className="game-body soda-game">
        <div className="game-heading">
          <div>
            <div className="eyebrow">
              <span className="live-dot" /> SODA SHOP DESKTOP{" "}
              <span className="version">/ v.2.0</span>
            </div>
            <h1>
              Potion <span>&</span> Ponder
              <span className="title-sparkle">✧</span>
            </h1>
            <p className="tagline">A little fizz. A little figuring out.</p>
          </div>
          <div className="shop-stamp">
            <svg viewBox="0 0 90 90" aria-hidden="true">
              <path
                d="m45 6 8 8 11-1 4 11 10 5-3 11 6 10-8 8-1 12-12 2-8 8-10-6-11 2-5-10-11-4 1-12-7-8 7-9 2-11 12-2Z"
                fill="#e1e9c1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M39 27v10q-18 8-9 24 15 13 30-1 7-16-9-23V27Zm-3 0h18"
                fill="#fff9e8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M31 48h27q4 16-13 16T31 48" fill="#b8a0d3" />
              <path
                d="m46 44 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"
                fill="#fff4b9"
                stroke="currentColor"
              />
            </svg>
            <span>SMALL BATCH HAPPINESS</span>
          </div>
        </div>
        <section className="level-strip">
          <div className="level-label">
            <span className="level-number">
              {String(level.number).padStart(2, "0")}
            </span>
            <div>
              <div className="eyebrow">
                LEVEL {String(level.number).padStart(2, "0")}{" "}
                <span className="chapter">/ {level.chapter}</span>
              </div>
              <h2>{level.title}</h2>
            </div>
          </div>
          <button className="tiny-link" onClick={() => open("archive")}>
            All levels <ChevronDown size={13} />
          </button>
        </section>
        <div className="game-workspace">
          <section className="puzzle-column" aria-label="Bottle shelf">
            <div className="shelf-toolbar">
              <span className="swap-total">
                SWAPS{" "}
                <b data-testid="swaps">
                  {String(state.swaps).padStart(2, "0")}
                </b>
              </span>
              <span>Swap. Observe. Ponder.</span>
            </div>
            <div className={`shelf-scene ${total > 4 ? "many-potions" : ""}`}>
              <div className="scene-top">
                <span>THE BOTTLE SHUFFLE</span>
                <Sparkles size={14} />
              </div>
              <span className="scene-sparkle sparkle-one">✧</span>
              <span className="scene-sparkle sparkle-two">+</span>
              <span className="scene-sparkle sparkle-three">✧</span>
              <div
                className="potion-grid"
                style={
                  {
                    "--columns":
                      total <= 4 ? total : total > 8 ? 3 : Math.ceil(total / 2),
                  } as React.CSSProperties
                }
              >
                {state.arrangement.map((id, index) => (
                  <div className="potion-slot" key={index}>
                    <motion.div
                      layout
                      className="bottle-wrap soda-wrap"
                      key={id}
                      layoutId={`bottle-${id}`}
                      transition={{
                        duration: SWAP_DURATION / 1000,
                        ease: "easeInOut",
                      }}
                    >
                      <motion.button
                        className={`bottle-button ${state.selected === index ? "selected" : ""}`}
                        aria-label={`Select bottle ${index + 1}, ${byId[id].name}`}
                        aria-pressed={state.selected === index}
                        disabled={game.animating || state.status !== "playing"}
                        onClick={() => game.select(index)}
                      >
                        <PotionBottle potion={byId[id]} />
                        {state.selected === index && (
                          <span className="selected-label">SELECTED</span>
                        )}
                      </motion.button>
                      <button
                        className="inspect-button"
                        aria-label={`Read ${byId[id].name} label`}
                        onClick={() => inspect(id)}
                      >
                        <Search size={14} />
                      </button>
                      <span className="bottle-caption">{byId[id].name}</span>
                    </motion.div>
                    <div className="shelf-plank" />
                    <div
                      className="slot-label"
                      aria-label={`Position ${index + 1}`}
                    >
                      <span className="position-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="shelf-instruction" aria-live="polite">
                <MousePointer2 size={14} />
                {state.status === "complete"
                  ? "Perfectly placed. Ready for another shelf?"
                  : state.selected !== null
                    ? "Now choose any other bottle to swap."
                    : "Select a bottle, then another to swap."}
              </div>
            </div>
            <div
              className="last-check live-progress"
              aria-live="polite"
              aria-atomic="true"
              aria-busy={game.animating}
            >
              <span className="eyebrow">BOTTLES IN PLACE</span>
              <strong
                key={`${state.level}-${state.swaps}`}
                data-testid="correct-count"
                className={
                  state.delta > 0
                    ? "count-up"
                    : state.delta < 0
                      ? "count-down"
                      : ""
                }
              >
                {count} / {total}
              </strong>
              <span
                className="progress-gain"
                key={`gain-${state.level}-${state.swaps}`}
              >
                {state.delta > 0 ? `+${state.delta} CORRECT` : ""}
              </span>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Bottles in place"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={count}
              >
                <div style={{ width: `${(count / total) * 100}%` }} />
              </div>
              <p>Updates after every swap. Only the total is revealed.</p>
            </div>
            <div className="game-actions soda-actions">
              <button
                className="retro-button"
                onClick={onReset}
                disabled={game.animating}
              >
                <RotateCcw size={15} /> Restart
              </button>
            </div>
            {state.status === "complete" && (
              <button
                className="retro-button coral next-shelf"
                onClick={onNext}
              >
                {state.level < 15 ? "Next level" : "Visit level archive"}{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </section>
          <aside className="clue-panel check-journal">
            <div className="clue-title">
              <BookOpen size={16} />
              <span>Your swap history</span>
              <span>✧</span>
            </div>
            <div className="clue-content">
              <div className="note-heading">
                <span className="eyebrow">THE LITTLE EXPERIMENT LOG</span>
                <p>
                  Swap. Observe. Ponder.
                  <br /> A new order, a new possibility.
                </p>
              </div>
              {state.history.length === 0 ? (
                <div className="empty-journal">
                  <div className="empty-count">
                    {count} / {total}
                  </div>
                  <p>
                    The shelf has a secret order.
                    <br />
                    Every swap updates your progress.
                  </p>
                  <span>
                    Experiment freely.
                    <br />
                    Take as many as you like.
                  </span>
                </div>
              ) : (
                <ol className="check-history" aria-label="Previous swaps">
                  {history.map((record) => (
                    <li key={record.swaps}>
                      <details open={record.swaps === state.swaps}>
                        <summary>
                          <span>
                            SWAP {String(record.swaps).padStart(2, "0")}
                          </span>
                          <b>
                            {record.count}/{total} correct
                          </b>
                        </summary>
                        <ol
                          className="history-order"
                          aria-label={`Order at swap ${record.swaps}`}
                        >
                          {record.arrangement.map((id, i) => (
                            <li key={id}>
                              <span>{i + 1}</span>
                              <i
                                style={{ background: byId[id].ink }}
                                aria-hidden="true"
                              />
                              {byId[id].name}
                            </li>
                          ))}
                        </ol>
                        <p className="history-caption">
                          At swap {record.swaps} · total matches only
                        </p>
                      </details>
                    </li>
                  ))}
                </ol>
              )}
              {state.history.length > 6 && (
                <button
                  className="tiny-link"
                  onClick={() => setAllHistory(!allHistory)}
                >
                  {allHistory
                    ? "Show latest six"
                    : `Show all ${state.history.length} swaps`}
                </button>
              )}
              <div className="note-footer">
                <Star size={15} />
                <span>
                  3 stars: {level.target} swaps
                  <br />2 stars: up to {twoStarLimit(level.target, total)} swaps
                  <br />1 star: every finished shelf
                </span>
              </div>
              <span className="note-signature">
                No rush. Just a little fizz ♡
              </span>
            </div>
          </aside>
        </div>
        {!tutorialDone && (
          <div className="tutorial">
            <span className="tutorial-pointer">
              <MousePointer2 size={22} />
            </span>
            <div>
              <b>YOUR FIRST LITTLE SHUFFLE</b>
              <p>
                The target order is hidden. Tap two bottles to swap; progress
                updates automatically. Only the total is revealed. Experiment as
                much as you like.
              </p>
            </div>
            <button className="tiny-link" onClick={finishTutorial}>
              Got it <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
      <footer className="window-status">
        <span>
          <span className="live-dot" /> Swap and observe. A little curiosity
          goes a long way.
        </span>
        <button onClick={() => open("help")}>
          <CircleHelp size={12} /> How to play
        </button>
        <span className="resize-mark">▧</span>
      </footer>
    </>
  );
}
export function Stars({ count, size = 17 }: { count: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${count} stars`}>
      {[1, 2, 3].map((i) => (
        <Star
          size={size}
          key={i}
          fill={i <= count ? "#e6bc61" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
