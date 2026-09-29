export type Difficulty = "easy" | "medium";

export interface DifficultyConfig {
  /** Rounds played in one game. */
  rounds: number;
  /** Grid size. Every cell holds at most one counter. */
  columns: number;
  rows: number;
  /** Lives per round. They are refilled at the start of every round. */
  lives: number;
}

/** One question: "how many?" */
export interface Round {
  /** The right answer: how many counters are on the grid. */
  count: number;
  /** Which counter is drawn, an id from COUNTERS. */
  counter: string;
  /** Grid cells that hold a counter, ascending, each used at most once. */
  cells: number[];
}
