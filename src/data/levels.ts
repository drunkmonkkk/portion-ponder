import {
  minimumSwaps,
  shuffle,
  startingArrangement,
} from "../utils/puzzleLogic";
export type Level = {
  number: number;
  title: string;
  chapter: string;
  solution: string[];
  initial: string[];
  target: number;
};
const selections = [
  ["cherry", "blue", "lime"],
  ["cherry", "blue", "lime", "sunny"],
  ["blue", "sunny", "berry", "cherry"],
  ["cherry", "blue", "lime", "sunny", "berry"],
  ["blue", "lime", "sunny", "berry", "peach"],
  ["cherry", "blue", "lime", "sunny", "berry", "cola"],
  ["cherry", "pink", "berry", "blue", "lime", "sunny"],
  ["peach", "orange", "sunny", "cola", "berry", "blue"],
  ["cherry", "pink", "peach", "orange", "sunny", "blue", "berry"],
  ["lime", "mint", "blue", "berry", "sunny", "cola", "peach"],
  ["peach", "orange", "cherry", "pink", "mint", "lime", "cola"],
  ["cherry", "blue", "lime", "sunny", "berry", "peach", "cola", "pink"],
  ["pink", "peach", "orange", "sunny", "mint", "lime", "blue", "berry"],
  ["cola", "cherry", "pink", "peach", "orange", "sunny", "lime", "mint"],
  ["cherry", "blue", "lime", "sunny", "berry", "peach", "cola", "pink", "mint"],
];
const titles = [
  "A little fizz to begin",
  "The four-pack shuffle",
  "Berry good company",
  "Five on the shelf",
  "Peachy little possibilities",
  "The six-pack picnic",
  "A rosy afternoon",
  "The sunshine selection",
  "Seven little surprises",
  "A mint condition mystery",
  "The flavor neighbors",
  "The big bottle shuffle",
  "Pastel pop party",
  "Almost a soda superstar",
  "The ultimate cozy collection",
];
export const levels: Level[] = selections.map((ids, i) => {
  const solution = shuffle(ids, 173 + i * 4729);
  const initial = startingArrangement(solution, 419 + i * 1907);
  return {
    number: i + 1,
    title: titles[i],
    chapter:
      i < 3
        ? "First little sips"
        : i < 8
          ? "Finding your fizz"
          : i < 11
            ? "Flavor explorer"
            : "Soda superstar",
    solution,
    initial,
    target: minimumSwaps(initial, solution),
  };
});
