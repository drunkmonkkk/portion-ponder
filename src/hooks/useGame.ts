import { useEffect, useRef, useState } from "react";
import { levels } from "../data/levels";
import { countCorrectPositions, rating, swap } from "../utils/puzzleLogic";
export type SwapRecord = {
  arrangement: string[];
  count: number;
  swaps: number;
};
export type GameState = {
  level: number;
  arrangement: string[];
  selected: number | null;
  swaps: number;
  correct: number;
  delta: number;
  status: "playing" | "won" | "complete";
  history: SwapRecord[];
};
export const SWAP_DURATION = 350;
export function initialState(level: number): GameState {
  const arrangement = [...levels[level - 1].initial];
  return {
    level,
    arrangement,
    selected: null,
    swaps: 0,
    correct: countCorrectPositions(arrangement, levels[level - 1].solution),
    delta: 0,
    status: "playing",
    history: [],
  };
}
export function useGame(
  start: number,
  onWin: (level: number, stars: number, swaps: number) => void,
  onSound: (type: "select" | "swap" | "positive" | "success") => void,
) {
  const [state, setState] = useState(() => initialState(start));
  const [animating, setAnimating] = useState(false);
  const ref = useRef(state),
    busy = useRef(false),
    timer = useRef<number | undefined>(undefined);
  const callbacks = useRef({ onWin, onSound });
  callbacks.current = { onWin, onSound };
  function commit(next: GameState) {
    ref.current = next;
    setState(next);
  }
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function select(index: number) {
    const s = ref.current;
    if (
      busy.current ||
      s.status !== "playing" ||
      index < 0 ||
      index >= s.arrangement.length
    )
      return;
    if (s.selected === null || s.selected === index) {
      commit({ ...s, selected: s.selected === index ? null : index });
      onSound("select");
      return;
    }
    busy.current = true;
    setAnimating(true);
    onSound("swap");
    const arrangement = swap(s.arrangement, s.selected, index);
    commit({ ...s, arrangement, selected: null, delta: 0 });
    timer.current = window.setTimeout(() => {
      const level = levels[s.level - 1];
      const correct = countCorrectPositions(arrangement, level.solution);
      const swaps = s.swaps + 1,
        delta = correct - s.correct;
      const won = correct === arrangement.length;
      commit({
        ...s,
        arrangement,
        selected: null,
        swaps,
        correct,
        delta,
        status: won ? "won" : "playing",
        history: [
          ...s.history,
          { arrangement: [...arrangement], count: correct, swaps },
        ],
      });
      busy.current = won;
      setAnimating(false);
      if (won) {
        callbacks.current.onSound("success");
        callbacks.current.onWin(
          s.level,
          rating(swaps, level.target, arrangement.length),
          swaps,
        );
      } else if (delta > 0) callbacks.current.onSound("positive");
    }, SWAP_DURATION);
  }
  function resume() {
    if (ref.current.status === "won")
      commit({ ...ref.current, status: "complete" });
  }
  function reset(level = ref.current.level) {
    window.clearTimeout(timer.current);
    busy.current = false;
    setAnimating(false);
    commit(initialState(level));
  }
  return {
    state,
    level: levels[state.level - 1],
    animating,
    select,
    resume,
    reset,
  };
}
