"use client";

import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES, DIFFICULTY_ORDER } from "@/lib/counting";

/**
 * Difficulty is communicated by colour and by a little picture of the grid
 * she is about to see: a small square for easy, a wide one for medium. The
 * words are there for whoever is helping, not for the player.
 */
const LEVEL_STYLES: Record<Difficulty, string> = {
  easy: "bg-[#5ec46f] border-[#3f9c50]",
  medium: "bg-[#ffc83d] border-[#d9a11e]",
};

function GridPreview({ difficulty }: { difficulty: Difficulty }) {
  const { columns, rows } = DIFFICULTIES[difficulty];
  return (
    <div
      aria-hidden="true"
      className="grid gap-1 roomy:gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns * rows }, (_, index) => (
        <span
          key={index}
          className="h-4 w-4 rounded-sm bg-white roomy:h-6 roomy:w-6"
        />
      ))}
    </div>
  );
}

export default function Landing({
  onStart,
}: {
  onStart: (difficulty: Difficulty) => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-4 px-4 py-6 roomy:max-w-2xl roomy:gap-6">
      <h1 className="text-center text-3xl font-black tracking-tight text-[color:var(--color-ink)] roomy:text-5xl">
        Vera&apos;s Counting Challenge
      </h1>

      <div className="flex items-center justify-center gap-2" aria-hidden="true">
        {["bee", "ladybug", "butterfly"].map((counter) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={counter}
            src={`/counters/${counter}.png`}
            alt=""
            width={112}
            height={112}
            className="h-24 w-24 object-contain drop-shadow-sm roomy:h-32 roomy:w-32"
          />
        ))}
      </div>

      <div className="flex w-full flex-col gap-3">
        {DIFFICULTY_ORDER.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            onClick={() => onStart(difficulty)}
            data-testid={`difficulty-${difficulty}`}
            aria-label={difficulty}
            className={`flex min-h-28 items-center justify-center rounded-3xl border-b-8 px-4 shadow-md active:translate-y-1 active:border-b-4 roomy:min-h-36 ${LEVEL_STYLES[difficulty]}`}
          >
            <GridPreview difficulty={difficulty} />
          </button>
        ))}
      </div>

      <p className="mt-auto pt-4 text-center text-[10px] leading-snug text-[color:var(--color-ink)]/50">
        Pictograms by Sergio Palao for ARASAAC (arasaac.org), owned by Gobierno
        de Aragón, licensed CC BY-NC-SA.
      </p>
    </main>
  );
}
