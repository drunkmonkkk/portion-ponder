import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { potions } from "../data/potions";
import {
  countCorrectPositions,
  isSolved,
  minimumSwaps,
  rating,
  shuffle,
  startingArrangement,
  swap,
  twoStarLimit,
} from "./puzzleLogic";
import { initialState } from "../hooks/useGame";
import {
  freshProgress,
  highestUnlocked,
  migrateProgress,
  recordCompletion,
} from "./storage";
import { composeMusic, MUSIC_SECONDS } from "./sound";

describe("the 15 fixed, hidden-order shelves", () => {
  const sizes = [3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9];
  for (const level of levels)
    it(`level ${level.number}: valid identities, unsolved start, optimal target`, () => {
      expect(level.initial).toHaveLength(sizes[level.number - 1]);
      expect(new Set(level.initial).size).toBe(level.initial.length);
      expect([...level.initial].sort()).toEqual([...level.solution].sort());
      expect(countCorrectPositions(level.initial, level.solution)).toBe(0);
      expect(
        level.initial.every((id) => potions.some((p) => p.id === id)),
      ).toBe(true);
      let order = [...level.initial],
        moves = 0;
      for (let i = 0; i < order.length; i++)
        if (order[i] !== level.solution[i]) {
          order = swap(order, i, order.indexOf(level.solution[i]));
          moves++;
        }
      expect(isSolved(order, level.solution)).toBe(true);
      expect(moves).toBe(level.target);
      expect(rating(moves, level.target, order.length)).toBe(3);
    });
  it("uses visibly distinct original brands", () => {
    expect(new Set(potions.map((p) => p.name)).size).toBe(10);
    expect(new Set(potions.map((p) => p.label.join(" "))).size).toBe(10);
    expect(new Set(levels.flatMap((l) => l.initial)).size).toBe(10);
  });
});
describe("pure position-matching rules", () => {
  it("returns a count, never identities or a correct-position mask", () => {
    expect(
      countCorrectPositions(["a", "b", "c", "d"], ["a", "c", "b", "d"]),
    ).toBe(2);
    expect(typeof countCorrectPositions(["a", "b"], ["b", "a"])).toBe("number");
  });
  it("compares unique IDs at exact indices", () => {
    expect(
      countCorrectPositions(
        ["lime", "mint", "cherry"],
        ["mint", "lime", "cherry"],
      ),
    ).toBe(1);
    expect(isSolved(["lime", "mint"], ["mint", "lime"])).toBe(false);
    expect(isSolved(["lime", "mint"], ["lime", "mint"])).toBe(true);
    expect(isSolved([], [])).toBe(false);
  });
  it("swaps immutably, permits deselection-equivalent identity swaps, rejects invalid indices", () => {
    const items = ["a", "b", "c"];
    expect(swap(items, 0, 2)).toEqual(["c", "b", "a"]);
    expect(items).toEqual(["a", "b", "c"]);
    expect(swap(items, 1, 1)).toEqual(items);
    expect(() => swap(items, 0, 3)).toThrow();
  });
  it("measures permutation cycles, including solved and independent pairs", () => {
    expect(minimumSwaps(["a", "b", "c", "d"], ["a", "b", "c", "d"])).toBe(0);
    expect(minimumSwaps(["b", "a", "d", "c"], ["a", "b", "c", "d"])).toBe(2);
    expect(minimumSwaps(["b", "c", "d", "a"], ["a", "b", "c", "d"])).toBe(3);
    expect(() => minimumSwaps(["a", "a"], ["a", "b"])).toThrow();
  });
  it("proves minimum swaps against breadth-first search for every four-bottle permutation", () => {
    const target = ["a", "b", "c", "d"],
      queue: [string[], number][] = [[target, 0]],
      seen = new Set<string>();
    while (queue.length) {
      const [order, distance] = queue.shift()!;
      const key = order.join();
      if (seen.has(key)) continue;
      seen.add(key);
      expect(minimumSwaps(order, target)).toBe(distance);
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          queue.push([swap(order, i, j), distance + 1]);
    }
    expect(seen.size).toBe(24);
  });
  it("shuffles deterministically without mutating inputs or returning solved starts", () => {
    const target = ["a", "b", "c", "d"];
    for (let seed = 0; seed < 100; seed++) {
      const start = startingArrangement(target, seed);
      expect(countCorrectPositions(start, target)).toBe(0);
      expect([...start].sort()).toEqual(target);
      expect(start).toEqual(startingArrangement(target, seed));
    }
    expect(shuffle(target, 99)).toEqual(shuffle(target, 99));
    expect(target).toEqual(["a", "b", "c", "d"]);
    expect(() => startingArrangement(["a"], 1)).toThrow();
  });
  it("awards stars only from swaps and the displayed thresholds", () => {
    expect(rating(3, 3, 5)).toBe(3);
    expect(rating(6, 3, 5)).toBe(2);
    expect(rating(7, 3, 5)).toBe(1);
    expect(twoStarLimit(2, 3)).toBe(4);
  });
  it("resets all active state and keeps the same target and starting order", () => {
    const state = initialState(15);
    expect(state).toEqual({
      level: 15,
      arrangement: levels[14].initial,
      selected: null,
      swaps: 0,
      correct: 0,
      delta: 0,
      status: "playing",
      history: [],
    });
    expect(state.arrangement).not.toBe(levels[14].initial);
    expect(state).not.toHaveProperty("hints");
    expect(state).not.toHaveProperty("incorrect");
  });
});
describe("safe versioned progress", () => {
  it("archives incompatible old progress by leaving v1 untouched and carrying preferences", () => {
    const legacy = {
      stars: { 1: 3, 15: 3 },
      discovered: ["moondew"],
      sound: false,
      reducedMotion: true,
      currentLevel: 15,
    };
    const copy = JSON.stringify(legacy);
    const result = migrateProgress(null, legacy);
    expect(result.stars).toEqual({});
    expect(result.currentLevel).toBe(1);
    expect(result.sound).toBe(false);
    expect(result.reducedMotion).toBe(true);
    expect(result.migrated).toBe(true);
    expect(JSON.stringify(legacy)).toBe(copy);
  });
  it("preserves best stars and lowest swaps independently on replay", () => {
    let p = recordCompletion(freshProgress(), 1, 3, 2);
    p = recordCompletion(p, 1, 1, 20);
    expect(p.stars[1]).toBe(3);
    expect(p.bestSwaps[1]).toBe(2);
    expect(highestUnlocked(p)).toBe(2);
  });
  it("sanitizes malformed save records and clamps audio preferences", () => {
    const p = migrateProgress(
      {
        version: 2,
        stars: { 1: 3, 2: 99, 16: 2 },
        bestSwaps: { 1: 2, 2: -2, 3: 8 },
        currentLevel: 15,
        volume: 20,
      },
      null,
    );
    expect(p.stars).toEqual({ 1: 3 });
    expect(p.bestSwaps).toEqual({ 1: 2 });
    expect(p.currentLevel).toBe(2);
    expect(p.volume).toBe(1);
    expect(migrateProgress("broken", null)).toEqual(freshProgress());
  });
  it("restores all valid new preferences and progression", () => {
    const p = {
      ...recordCompletion(freshProgress(), 1, 2, 4),
      currentLevel: 2,
      music: false,
      sound: false,
      volume: 0.12,
      tutorialDone: true,
    };
    expect(migrateProgress(p, null)).toEqual(p);
  });
});
describe("original instrumental composition", () => {
  it("contains an actual deterministic, non-clipping musical waveform", () => {
    const a = composeMusic(8000),
      b = composeMusic(8000);
    expect(a.length).toBe(Math.round(MUSIC_SECONDS * 8000));
    let energy = 0,
      peak = 0;
    for (let i = 0; i < a.length; i++) {
      energy += a[i] * a[i];
      peak = Math.max(peak, Math.abs(a[i]));
    }
    expect(a).toEqual(b);
    expect(energy / a.length).toBeGreaterThan(0.00001);
    expect(peak).toBeLessThan(1);
  });
});
