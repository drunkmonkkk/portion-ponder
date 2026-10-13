import {
  LockKeyhole,
  ArrowUpRight,
  BookOpen,
  Music2,
  Volume2,
  Sparkles,
  Check,
} from "lucide-react";
import { byId, potions } from "../data/potions";
import { levels } from "../data/levels";
import type { Progress } from "../utils/storage";
import type { MusicStatus } from "../utils/sound";
import { highestUnlocked } from "../utils/storage";
import { PotionBottle } from "./PotionBottle";
import { Stars } from "./GameWindow";
export function PotionInspector({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const p = byId[id];
  return (
    <div className="inspector-body">
      <div className="inspector-heading">
        <span className="eyebrow">THE SMALL BATCH SODA COLLECTION</span>
        <h2>{p.name}</h2>
        <span className="paper-label">
          ORIGINAL FLAVOR • ALWAYS A LITTLE FIZZY
        </span>
      </div>
      <div className="inspection-layout">
        <div className="specimen">
          <span className="specimen-spark">✧</span>
          <PotionBottle potion={p} large />
          <span className="eyebrow">BOTTLED HAPPINESS</span>
        </div>
        <div>
          <dl className="potion-facts">
            <div>
              <dt>Flavor</dt>
              <dd>{p.flavor}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>{p.color}</dd>
            </div>
            <div>
              <dt>Packaging</dt>
              <dd>{p.pattern}</dd>
            </div>
          </dl>
          <p className="potion-lore">
            A little pop of {p.flavor.toLowerCase()}. One of ten original drinks
            made just for this cozy little desktop.
          </p>
        </div>
      </div>
      <div className="inspector-bottom">
        <span>
          The label tells you the drink. Its position is yours to discover.
        </span>
        <button className="retro-button yellow" onClick={onClose}>
          Back to swapping <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
export function Potionpedia({ inspect }: { inspect: (id: string) => void }) {
  return (
    <div className="aux-body">
      <span className="eyebrow">
        TEN ORIGINAL FLAVORS. ONE HAPPY LITTLE SHELF.
      </span>
      <h2 className="aux-heading">Meet the bottle bunch.</h2>
      <p className="aux-description">
        Names, flavors, colors, and a little personality. Every drink is yours
        to explore.
      </p>
      <div className="database-status">
        <BookOpen size={15} /> BOTTLEPEDIA v2.0{" "}
        <span>{potions.length} fictional flavors</span>
      </div>
      <div className="pedia-grid">
        {potions.map((p) => (
          <button
            key={p.id}
            className="pedia-card"
            onClick={() => inspect(p.id)}
          >
            <PotionBottle potion={p} />
            <h3>{p.name}</h3>
            <span>{p.color}</span>
            <p>{p.flavor}</p>
            <small>{p.pattern} packaging</small>
          </button>
        ))}
      </div>
    </div>
  );
}
export function LevelArchive({
  progress,
  current,
  onChoose,
}: {
  progress: Progress;
  current: number;
  onChoose: (n: number) => void;
}) {
  const unlocked = highestUnlocked(progress);
  return (
    <div className="aux-body">
      <span className="eyebrow">FIFTEEN SHELVES. PLENTY OF POSSIBILITIES.</span>
      <h2 className="aux-heading">The level archive.</h2>
      <p className="aux-description">
        From your first little sip to a nine-bottle shuffle.
      </p>
      <div className="archive-progress">
        <span>{Object.keys(progress.stars).length} / 15 shelves sorted</span>
        <span>
          <Stars count={3} size={13} />
          {Object.values(progress.stars).reduce((a, b) => a + b, 0)} / 45
        </span>
      </div>
      <div className="level-grid">
        {levels.map((l) => (
          <button
            className={`level-card ${current === l.number ? "current" : ""}`}
            key={l.number}
            disabled={l.number > unlocked}
            onClick={() => onChoose(l.number)}
            aria-label={`Level ${l.number}: ${l.title}${l.number > unlocked ? ", locked" : ""}`}
          >
            <span className="level-file">
              {l.number > unlocked ? (
                <LockKeyhole size={20} />
              ) : (
                <span>{String(l.number).padStart(2, "0")}</span>
              )}
            </span>
            <span className="level-card-title">{l.title}</span>
            <span className="level-card-state">{l.initial.length} BOTTLES</span>
            {progress.stars[l.number] ? (
              <>
                <Stars count={progress.stars[l.number]} size={12} />
                <span className="best-swaps">
                  Best: {progress.bestSwaps[l.number] ?? "—"} swaps
                </span>
              </>
            ) : (
              <span className="level-card-state">
                {l.number > unlocked
                  ? "LOCKED"
                  : current === l.number
                    ? "CURRENT SHELF"
                    : "READY TO SHUFFLE"}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="footnote">
        Stars reward fewer swaps. Explore freely and keep your best rating. Your
        best stars and lowest swap count are saved separately.
      </p>
    </div>
  );
}
export function Help() {
  return (
    <div className="aux-body help-body">
      <span className="eyebrow">HOW TO PLAY.txt • THE COZY EDITION</span>
      <h2 className="aux-heading">A little fizz. A little logic.</h2>
      <p>
        Every shelf has a secret bottle order. You can see each drink’s name,
        but its home is a mystery. Live progress tells you only how many
        positions match.
      </p>
      <ol className="help-steps">
        {[
          [
            "Pick two bottles.",
            "Click or tap any bottle, then another to swap them. Click the selected bottle again to put it down. Each exchange counts as one swap.",
          ],
          [
            "Watch your progress.",
            "After every swap, the counter updates automatically, such as 2 / 5 bottles in place. It never tells you which bottles match.",
          ],
          [
            "Keep experimenting.",
            "Your swap history records each order and its total. Compare your own attempts as you try new swaps. The secret order stays the same.",
          ],
          [
            "Find everyone’s place.",
            "Match every position to finish automatically. Each completed shelf unlocks the next one. There are 15 shelves and up to nine bottles.",
          ],
        ].map(([title, body], i) => (
          <li key={title}>
            <span>{i + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="help-note">
        <b>Every finished shelf is a little win.</b>
        <p>
          Three stars: use the minimum swaps. Two stars: use up to the minimum
          plus half the bottle count, rounded up (at least two extra). One star:
          finish the shelf. The final swap completes the level automatically.
        </p>
        <p>
          Positions read left to right, then continue on the next row. Keyboard:
          Tab between buttons and Enter or Space to select. Your stars and best
          swaps save automatically.
        </p>
      </div>
      <p className="note-signature">Take your time. Enjoy the fizz ♡</p>
    </div>
  );
}
const musicLabels: Record<MusicStatus, string> = {
  waiting: "Starts with your first click or keypress.",
  playing: "Now playing: A Little Fizz • original loop",
  paused: "Paused while the tab is inactive.",
  off: "The turntable is taking a little rest.",
  unavailable: "Audio is unavailable in this browser. The game still works.",
};
export function Settings({
  progress,
  update,
  onErase,
  storageOk,
  musicStatus,
}: {
  progress: Progress;
  update: (change: Partial<Progress>) => void;
  onErase: () => void;
  storageOk: boolean;
  musicStatus: MusicStatus;
}) {
  return (
    <div className="aux-body">
      <span className="eyebrow">MAKE YOURSELF AT HOME</span>
      <h2 className="aux-heading">A few little preferences.</h2>
      <div className="setting-row">
        <div>
          <h3>
            <Music2 size={18} /> Background music
          </h3>
          <p data-testid="music-status">{musicLabels[musicStatus]}</p>
        </div>
        <button
          className={`toggle ${progress.music ? "on" : ""}`}
          role="switch"
          aria-checked={progress.music}
          aria-label="Background music"
          onClick={() => update({ music: !progress.music })}
        >
          <span />
          {progress.music ? "ON" : "OFF"}
        </button>
      </div>
      <div className="volume-setting">
        <label htmlFor="music-volume">
          Music volume <output>{Math.round(progress.volume * 100)}%</output>
        </label>
        <input
          id="music-volume"
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(progress.volume * 100)}
          onChange={(e) => update({ volume: Number(e.target.value) / 100 })}
        />
        <p>
          Soft keys, warm chords, and a tiny chiptune melody. Written just for
          Potion & Ponder.
        </p>
      </div>
      <div className="setting-row">
        <div>
          <h3>
            <Volume2 size={18} /> Sound effects
          </h3>
          <p>
            Quiet clicks, bubble pops, and celebrations.
            <br />
            Independent of background music.
          </p>
        </div>
        <button
          className={`toggle ${progress.sound ? "on" : ""}`}
          role="switch"
          aria-checked={progress.sound}
          aria-label="Sound effects"
          onClick={() => update({ sound: !progress.sound })}
        >
          <span />
          {progress.sound ? "ON" : "OFF"}
        </button>
      </div>
      <div className="setting-row">
        <div>
          <h3>
            <Sparkles size={18} /> Less motion
          </h3>
          <p>
            Keep things still and cozy.
            <br />
            Your device’s preference is also respected.
          </p>
        </div>
        <button
          className={`toggle ${progress.reducedMotion ? "on" : ""}`}
          role="switch"
          aria-checked={progress.reducedMotion}
          aria-label="Less motion"
          onClick={() => update({ reducedMotion: !progress.reducedMotion })}
        >
          <span />
          {progress.reducedMotion ? "ON" : "OFF"}
        </button>
      </div>
      <div className="save-status">
        <Check size={17} />
        <div>
          <b>
            {storageOk
              ? "Your little victories are safe."
              : "Progress is temporary."}
          </b>
          <p>
            {storageOk
              ? "Stars, best swaps, and preferences save in this browser."
              : "Browser storage is unavailable. Keep this tab open to retain progress."}
          </p>
        </div>
      </div>
      <button className="retro-button" onClick={onErase}>
        Clear saved progress…
      </button>
    </div>
  );
}
