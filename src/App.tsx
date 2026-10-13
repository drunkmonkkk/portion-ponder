import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Sparkles,
  Music2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { DesktopArt, DesktopIcon } from "./components/DesktopIcon";
import type { AppId } from "./components/DesktopIcon";
import { RetroWindow } from "./components/RetroWindow";
import { GameWindow, Stars } from "./components/GameWindow";
import {
  Help,
  LevelArchive,
  PotionInspector,
  Potionpedia,
  Settings,
} from "./components/AuxWindows";
import { PotionBottle } from "./components/PotionBottle";
import { byId } from "./data/potions";
import { Modal } from "./components/Modal";
import { useGame } from "./hooks/useGame";
import { useWindowManager } from "./hooks/useWindowManager";
import {
  freshProgress,
  recordCompletion,
  highestUnlocked,
  readProgress,
  writeProgress,
} from "./utils/storage";
import type { Progress } from "./utils/storage";
import { useAudio } from "./hooks/useAudio";
import { rating } from "./utils/puzzleLogic";
const appNames: Record<AppId, string> = {
  game: "Potion & Ponder.exe",
  pedia: "Bottlepedia.exe",
  archive: "Level Archive.exe",
  help: "How to Play.txt",
  settings: "Preferences.exe",
  recycle: "Recycle Bin",
  inspector: "Bottle Label.exe",
};
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  return (
    <time>
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </time>
  );
}
export default function App() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<Progress>(readProgress),
    [storageOk, setStorageOk] = useState(true);
  const [inspected, setInspected] = useState<{
    id: string;
  } | null>(null);
  const [startMenu, setStartMenu] = useState(false),
    [confirmation, setConfirmation] = useState<
      "reset" | "erase" | number | null
    >(null);
  const wm = useWindowManager();
  const audio = useAudio(progress);
  const systemReduced = useReducedMotion();
  const update = (change: Partial<Progress>) =>
    setProgress((p) => ({ ...p, ...change }));
  const game = useGame(
    Math.min(progress.currentLevel, highestUnlocked(progress)),
    (level, stars, swaps) => {
      setProgress((p) => recordCompletion(p, level, stars, swaps));
    },
    audio.effect,
  );
  const { state } = game;
  useEffect(() => {
    setStorageOk(writeProgress(progress));
  }, [progress]);
  useEffect(() => {
    document.documentElement.dataset.motion =
      progress.reducedMotion || systemReduced ? "reduced" : "full";
  }, [progress.reducedMotion, systemReduced]);
  const open = (id: AppId) => {
    wm.open(id);
    setStartMenu(false);
    audio.effect("click");
  };
  const startLevel = (n: number) => {
    if (n > highestUnlocked(progress)) return;
    game.reset(n);
    update({ currentLevel: n });
    wm.close("inspector");
    wm.close("archive");
    open("game");
  };
  const inspect = (id: string) => {
    setInspected({ id });
    open("inspector");
  };
  const fresh = state.swaps === 0 && !game.animating;
  const choose = (n: number) => {
    if (n === state.level) {
      wm.close("archive");
      open("game");
      return;
    }
    if (!fresh && state.status !== "won" && state.status !== "complete")
      setConfirmation(n);
    else startLevel(n);
  };
  const common = (id: AppId) => ({
    onClose: () => wm.close(id),
    onMinimize: () => wm.minimize(id),
    onMaximize: () => wm.maximize(id),
    onFocus: () => wm.front(id),
  });
  return (
    <MotionConfig reducedMotion={progress.reducedMotion ? "always" : "user"}>
      <div className="desktop" ref={desktopRef}>
        <div className="desktop-topline">
          <span>
            <span className="live-dot" /> PONDER OS
          </span>
          <span>
            A QUIETER CORNER OF THE INTERNET <span>✦</span>
          </span>
        </div>
        <div className="desktop-wallpaper" aria-hidden="true">
          <span className="wallpaper-orbit" />
          <span className="wallpaper-star star-a">✧</span>
          <span className="wallpaper-star star-b">✦</span>
          <span className="wallpaper-star star-c">✧</span>
          <div className="wallpaper-brand">
            a little
            <br />
            <i>everyday</i>
            <br />
            magic.
          </div>
          <span className="wallpaper-caption">
            EST. WHENEVER YOU NEED A BREAK
          </span>
        </div>
        <nav className="desktop-icons" aria-label="Desktop applications">
          <DesktopIcon
            kind="game"
            label="Potion & Ponder"
            onClick={() => open("game")}
          />
          <DesktopIcon
            kind="pedia"
            label="Bottlepedia"
            onClick={() => open("pedia")}
          />
          <DesktopIcon
            kind="archive"
            label="Level Archive"
            onClick={() => open("archive")}
          />
          <DesktopIcon
            kind="help"
            label="How to Play.txt"
            onClick={() => open("help")}
          />
          <DesktopIcon
            kind="settings"
            label="Preferences"
            onClick={() => open("settings")}
          />
        </nav>
        <div className="desktop-recycle">
          <DesktopIcon
            kind="recycle"
            label="Recycle Bin"
            onClick={() => open("recycle")}
          />
        </div>
        <AnimatePresence>
          {wm.windows.map((w) => (
            <RetroWindow
              key={w.id}
              state={w}
              boundsRef={desktopRef}
              title={
                w.id === "game"
                  ? `${appNames.game} — Level ${String(state.level).padStart(2, "0")}`
                  : appNames[w.id]
              }
              {...common(w.id)}
            >
              {w.id === "game" && (
                <GameWindow
                  key={state.level}
                  game={game}
                  open={open}
                  inspect={inspect}
                  onNext={() =>
                    state.level < 15
                      ? startLevel(state.level + 1)
                      : open("archive")
                  }
                  tutorialDone={progress.tutorialDone}
                  finishTutorial={() => update({ tutorialDone: true })}
                  onReset={() => {
                    if (fresh) game.reset();
                    else setConfirmation("reset");
                  }}
                />
              )}
              {w.id === "pedia" && <Potionpedia inspect={inspect} />}
              {w.id === "archive" && (
                <LevelArchive
                  progress={progress}
                  current={state.level}
                  onChoose={choose}
                />
              )}
              {w.id === "help" && <Help />}
              {w.id === "settings" && (
                <Settings
                  progress={progress}
                  update={update}
                  onErase={() => setConfirmation("erase")}
                  storageOk={storageOk}
                  musicStatus={audio.status}
                />
              )}
              {w.id === "inspector" && inspected && (
                <PotionInspector
                  {...inspected}
                  onClose={() => wm.close("inspector")}
                />
              )}
              {w.id === "recycle" && (
                <div className="aux-body recycle-body">
                  <DesktopArt kind="recycle" />
                  <h2 className="aux-heading">Nothing to throw away.</h2>
                  <p>
                    Not even your mistakes.
                    <br />
                    Every shuffle holds a new possibility.
                  </p>
                  <span className="eyebrow">
                    0 ITEMS • PLENTY OF POSSIBILITY
                  </span>
                </div>
              )}
            </RetroWindow>
          ))}
        </AnimatePresence>
        {!wm.windows.some((w) => w.id === "game" && !w.minimized) && (
          <button
            className="reopen-game retro-button yellow"
            onClick={() => open("game")}
          >
            <Sparkles size={17} /> Return to your shelf <ArrowRight size={17} />
          </button>
        )}
        <div className="desktop-bottom-note">
          <span>✧</span> no rush. just a little hocus-focus.
        </div>
        <footer className="taskbar">
          <button
            className={`start-button ${startMenu ? "active" : ""}`}
            aria-expanded={startMenu}
            onClick={() => setStartMenu(!startMenu)}
          >
            <Sparkles size={17} /> Start
          </button>
          <div className="taskbar-divider" />
          <div className="taskbar-apps">
            {wm.windows
              .filter((w) => w.id !== "inspector")
              .map((w) => (
                <button
                  key={w.id}
                  className={`taskbar-app ${w.minimized ? "" : "running"}`}
                  onClick={() => wm.open(w.id)}
                >
                  <span className="taskbar-app-icon" aria-hidden="true">
                    {w.id === "game" ? <Sparkles size={14} /> : <span>▤</span>}
                  </span>
                  <span>{appNames[w.id]}</span>
                </button>
              ))}
          </div>
          <div className="system-tray">
            <button
              className="taskbar-music"
              aria-label={progress.music ? "Music off" : "Music on"}
              aria-pressed={progress.music}
              onClick={() => update({ music: !progress.music })}
            >
              <Music2 size={16} />
              <span>MUSIC {progress.music ? "ON" : "OFF"}</span>
            </button>
            <button
              aria-label={
                progress.sound ? "Sound effects off" : "Sound effects on"
              }
              aria-pressed={progress.sound}
              onClick={() => update({ sound: !progress.sound })}
            >
              {progress.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <span className="tray-separator" />
            <Clock />
            <span className="tray-flower">✿</span>
          </div>
        </footer>
        {startMenu && (
          <>
            <button
              className="start-dismiss"
              aria-label="Close Start menu"
              onClick={() => setStartMenu(false)}
            />
            <nav className="start-menu" aria-label="Start menu">
              <div className="start-menu-brand">
                PONDER OS <span>v.2.0</span>
              </div>
              {(
                ["game", "pedia", "archive", "help", "settings"] as AppId[]
              ).map((id) => (
                <button key={id} onClick={() => open(id)}>
                  <DesktopArt kind={id} />
                  {appNames[id]}
                  <ArrowRight size={14} />
                </button>
              ))}
            </nav>
          </>
        )}
        {state.status === "won" && (
          <Modal title="A little celebration.exe" onClose={game.resume}>
            <div className="celebration" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} style={{ "--i": i } as React.CSSProperties}>
                  {i % 3 ? "✦" : "◆"}
                </span>
              ))}
              <div className="success-seal victory-bottle">
                <PotionBottle potion={byId[state.arrangement[0]]} />
              </div>
            </div>
            <span className="eyebrow">A PLACE FOR EVERY LITTLE MAGIC</span>
            <h2>Perfectly placed!</h2>
            <p>
              {state.arrangement.length} / {state.arrangement.length} BOTTLES
              CORRECT!
              <br />
              {state.level === 15
                ? "All fifteen shelves sorted. You’re a soda superstar!"
                : "You did it! Everyone’s in their happy place."}
            </p>
            <Stars
              count={rating(
                state.swaps,
                game.level.target,
                state.arrangement.length,
              )}
              size={36}
            />
            <div className="success-stats">
              <span>
                SWAPS USED <b>{state.swaps}</b>
              </span>
            </div>
            <span className="saved-badge">
              <Check size={12} />
              {storageOk
                ? "Your progress has been saved."
                : "Progress saved for this session only."}
            </span>
            <div className="dialog-actions">
              <button
                className="retro-button coral"
                onClick={() =>
                  state.level < 15
                    ? startLevel(state.level + 1)
                    : (game.resume(), open("archive"))
                }
              >
                {state.level < 15 ? "Next level" : "Visit level archive"}{" "}
                <ArrowRight size={16} />
              </button>
              <button
                className="tiny-link"
                onClick={() => {
                  game.resume();
                  open("pedia");
                }}
              >
                Visit Bottlepedia
              </button>
            </div>
          </Modal>
        )}
        {progress.migrated && (
          <Modal
            title="A fresh little chapter.exe"
            onClose={() => update({ migrated: false })}
          >
            <span className="eyebrow">WELCOME TO THE BOTTLE SHUFFLE</span>
            <h2>New fizz. Fresh shelves.</h2>
            <p>
              The puzzles have changed, so your new shelves start at level 1.
              Your original potion progress is safely kept in this browser’s old
              save. Your sound and motion preferences have carried over.
            </p>
            <button
              className="retro-button coral"
              onClick={() => update({ migrated: false })}
            >
              Let’s shuffle <ArrowRight size={16} />
            </button>
          </Modal>
        )}
        {confirmation !== null && (
          <Modal
            title="Just a moment.exe"
            onClose={() => setConfirmation(null)}
          >
            <h2>
              {confirmation === "erase"
                ? "A completely fresh start?"
                : confirmation === "reset"
                  ? "Reset this little shelf?"
                  : "Visit another shelf?"}
            </h2>
            <p>
              {confirmation === "erase"
                ? "This clears your new shelf progress, stars, best swaps, and audio preferences. Your archived original save is kept. This cannot be undone."
                : "Your current arrangement, swaps, and swap history will reset. The secret order stays the same. Saved stars and best swaps stay safe."}
            </p>
            <div className="dialog-actions">
              <button
                className="retro-button coral"
                onClick={() => {
                  if (confirmation === "erase") {
                    setProgress(freshProgress());
                    game.reset(1);
                    wm.close("inspector");
                  } else if (typeof confirmation === "number")
                    startLevel(confirmation);
                  else {
                    game.reset();
                    wm.close("inspector");
                  }
                  setConfirmation(null);
                }}
              >
                Yes,{" "}
                {confirmation === "erase"
                  ? "clear progress"
                  : confirmation === "reset"
                    ? "reset shelf"
                    : "change shelf"}
              </button>
              <button
                className="retro-button"
                onClick={() => setConfirmation(null)}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </Modal>
        )}
        {!storageOk && (
          <div className="storage-warning" role="status">
            Browser storage is unavailable. Progress lasts for this session.
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
