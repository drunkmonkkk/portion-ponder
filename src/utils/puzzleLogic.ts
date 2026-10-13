/** IDs and indices are the only inputs to correctness. Never return a per-slot mask. */
export function countCorrectPositions(
  arrangement: readonly string[],
  target: readonly string[],
): number {
  if (arrangement.length !== target.length)
    throw new Error("Arrangements must have equal length");
  return arrangement.reduce(
    (count, id, i) => count + Number(id === target[i]),
    0,
  );
}
export function isSolved(
  arrangement: readonly string[],
  target: readonly string[],
) {
  return (
    arrangement.length > 0 &&
    arrangement.length === target.length &&
    countCorrectPositions(arrangement, target) === target.length
  );
}
export function swap(items: readonly string[], a: number, b: number): string[] {
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    a < 0 ||
    b < 0 ||
    a >= items.length ||
    b >= items.length
  )
    throw new RangeError("Invalid bottle position");
  const result = [...items];
  [result[a], result[b]] = [result[b], result[a]];
  return result;
}
export function minimumSwaps(
  initial: readonly string[],
  target: readonly string[],
): number {
  if (
    new Set(initial).size !== initial.length ||
    initial.length !== target.length ||
    new Set(target).size !== target.length ||
    initial.some((id) => !target.includes(id))
  )
    throw new Error("Expected permutations of unique bottle IDs");
  const next = new Map(target.map((id, i) => [id, i]));
  const visited = new Set<number>();
  let swaps = 0;
  for (let i = 0; i < initial.length; i++) {
    if (visited.has(i)) continue;
    let j = i,
      size = 0;
    while (!visited.has(j)) {
      visited.add(j);
      size++;
      j = next.get(initial[j])!;
    }
    swaps += Math.max(0, size - 1);
  }
  return swaps;
}
/** Stable seed keeps a level's secret order fixed across checks, retries and refreshes. */
export function shuffle(items: readonly string[], seed: number): string[] {
  const result = [...items];
  let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const j = value % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function startingArrangement(
  target: readonly string[],
  seed: number,
): string[] {
  if (target.length < 2 || new Set(target).size !== target.length)
    throw new Error("At least two unique bottles are required");
  for (let i = 0; i < 64; i++) {
    const attempt = shuffle(target, seed + i * 7919);
    if (countCorrectPositions(attempt, target) === 0) return attempt;
  }
  return [...target.slice(1), target[0]];
}
export function twoStarLimit(minimum: number, bottles: number) {
  return minimum + Math.max(2, Math.ceil(bottles / 2));
}
export function rating(
  swaps: number,
  minimum: number,
  bottles: number,
): number {
  return swaps <= minimum ? 3 : swaps <= twoStarLimit(minimum, bottles) ? 2 : 1;
}
