import type { Difficulty, DifficultyConfig, Round } from "./types";

/**
 * Things Vera can count. Each one is a single, whole object that comes in
 * numbers, with a matching ARASAAC pictogram in public/counters/{id}.png.
 */
export const COUNTERS = [
  "apple",
  "banana",
  "bee",
  "butterfly",
  "dog",
  "duck",
  "flower",
  "frog",
  "icecream",
  "ladybug",
  "pear",
  "strawberry",
] as const;

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { rounds: 10, columns: 3, rows: 3, lives: 3 },
  medium: { rounds: 10, columns: 6, rows: 4, lives: 3 },
};

export const DIFFICULTY_ORDER: readonly Difficulty[] = ["easy", "medium"];

/** Number of grid cells, which is also the biggest number she can be asked for. */
export function cellCount(difficulty: Difficulty): number {
  const { columns, rows } = DIFFICULTIES[difficulty];
  return columns * rows;
}

/** Deterministic 32-bit hash, to turn "easy:7" into a PRNG seed. */
function hashString(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — small seeded PRNG, so `?seed=` can replay a game exactly. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates, using whichever random source is handed in. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** A whole number from `min` to `max`, both included. */
function randomInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/**
 * One round: a random number, a random counter, and that many counters dropped
 * into random, distinct cells of the grid.
 *
 * `previous` is the round before this one. Its number and counter are avoided,
 * so two rounds in a row never look like the same question.
 */
export function buildRound(
  difficulty: Difficulty,
  random: () => number = Math.random,
  previous?: Round,
): Round {
  const total = cellCount(difficulty);

  let count = randomInt(1, total, random);
  while (previous && count === previous.count) {
    count = randomInt(1, total, random);
  }

  const choices = COUNTERS.filter((id) => id !== previous?.counter);
  const counter = choices[Math.floor(random() * choices.length)];

  const cells = shuffle(
    Array.from({ length: total }, (_, index) => index),
    random,
  )
    .slice(0, count)
    .sort((a, b) => a - b);

  return { count, counter, cells };
}

/**
 * All the rounds for one game. Without a `seed` every game is different; with
 * one, the same game comes back every time, which is what the end-to-end tests
 * rely on.
 */
export function buildRounds(difficulty: Difficulty, seed?: number): Round[] {
  const random =
    seed === undefined
      ? Math.random
      : seededRandom(hashString(`${difficulty}:${seed}`));
  const rounds: Round[] = [];
  for (let i = 0; i < DIFFICULTIES[difficulty].rounds; i++) {
    rounds.push(buildRound(difficulty, random, rounds[i - 1]));
  }
  return rounds;
}
