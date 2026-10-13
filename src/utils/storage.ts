export const SAVE_KEY = "potion-ponder-v2";
export const LEGACY_KEY = "potion-ponder-v1";
export type Progress = {
  version: 2;
  stars: Record<number, number>;
  bestSwaps: Record<number, number>;
  music: boolean;
  sound: boolean;
  volume: number;
  reducedMotion: boolean;
  tutorialDone: boolean;
  currentLevel: number;
  migrated: boolean;
};
export function freshProgress(): Progress {
  return {
    version: 2,
    stars: {},
    bestSwaps: {},
    music: true,
    sound: true,
    volume: 0.35,
    reducedMotion: false,
    tutorialDone: false,
    currentLevel: 1,
    migrated: false,
  };
}
const validRecord = (input: unknown, min: number, max: number) => {
  const result: Record<number, number> = {};
  if (!input || typeof input !== "object") return result;
  for (let n = 1; n <= 15; n++) {
    const value = (input as Record<number, unknown>)[n];
    if (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= min &&
      value <= max
    )
      result[n] = value;
  }
  return result;
};
export function migrateProgress(raw: unknown, legacy: unknown): Progress {
  const base = freshProgress();
  if (
    raw &&
    typeof raw === "object" &&
    (raw as { version?: number }).version === 2
  ) {
    const p = raw as Partial<Progress>;
    const stars = validRecord(p.stars, 1, 3),
      bestSwaps = validRecord(p.bestSwaps, 0, Number.MAX_SAFE_INTEGER);
    for (const n of Object.keys(bestSwaps))
      if (!stars[Number(n)]) delete bestSwaps[Number(n)];
    const result = {
      ...base,
      stars,
      bestSwaps,
      music: p.music !== false,
      sound: p.sound !== false,
      volume:
        typeof p.volume === "number" && Number.isFinite(p.volume)
          ? Math.min(1, Math.max(0, p.volume))
          : 0.35,
      reducedMotion: p.reducedMotion === true,
      tutorialDone: p.tutorialDone === true,
      migrated: p.migrated === true,
    };
    result.currentLevel =
      typeof p.currentLevel === "number" && Number.isInteger(p.currentLevel)
        ? Math.max(1, Math.min(p.currentLevel, highestUnlocked(result)))
        : 1;
    return result;
  }
  if (legacy && typeof legacy === "object") {
    const p = legacy as { sound?: boolean; reducedMotion?: boolean };
    // The old levels and their ratings are incompatible. Leave the v1 save intact.
    return {
      ...base,
      sound: p.sound === true,
      reducedMotion: p.reducedMotion === true,
      migrated: true,
    };
  }
  return base;
}
function parse(text: string | null): unknown {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
export function readProgress(): Progress {
  try {
    return migrateProgress(
      parse(localStorage.getItem(SAVE_KEY)),
      parse(localStorage.getItem(LEGACY_KEY)),
    );
  } catch {
    return freshProgress();
  }
}
export function writeProgress(progress: Progress): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
export function highestUnlocked(progress: Pick<Progress, "stars">) {
  let n = 1;
  while (n < 15 && progress.stars[n]) n++;
  return n;
}
export function recordCompletion(
  progress: Progress,
  level: number,
  stars: number,
  swaps: number,
): Progress {
  return {
    ...progress,
    stars: {
      ...progress.stars,
      [level]: Math.max(progress.stars[level] || 0, stars),
    },
    bestSwaps: {
      ...progress.bestSwaps,
      [level]: Math.min(progress.bestSwaps[level] ?? Infinity, swaps),
    },
    tutorialDone: true,
  };
}
