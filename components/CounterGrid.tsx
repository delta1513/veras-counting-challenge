"use client";

import type { Round } from "@/lib/types";

/**
 * The grid of things to count. Every cell holds at most one counter, and an
 * empty cell is a plain, quiet tile so the counters are what the eye lands on.
 *
 * The grid keeps its shape (3x3, 6x4) and takes the biggest size that fits in
 * whatever space the header and keypad leave, so it never pushes the keys off
 * screen on a short tablet.
 */
export default function CounterGrid({
  round,
  columns,
  rows,
  shake,
}: {
  round: Round;
  columns: number;
  rows: number;
  shake: boolean;
}) {
  const filled = new Set(round.cells);

  return (
    <div className="flex min-h-40 flex-1 items-center justify-center py-1 roomy:py-2 [container-type:size]">
      <div
        data-testid="grid"
        data-columns={columns}
        data-rows={rows}
        data-counter={round.counter}
        className={`grid gap-1.5 roomy:gap-3 ${shake ? "animate-shake" : ""}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          aspectRatio: `${columns} / ${rows}`,
          width: `min(100cqw, calc(100cqh * ${columns} / ${rows}))`,
        }}
      >
        {Array.from({ length: columns * rows }, (_, index) => {
          const occupied = filled.has(index);
          return (
            <div
              key={index}
              data-testid={`cell-${index}`}
              data-occupied={occupied ? "true" : "false"}
              className={`flex items-center justify-center rounded-2xl ${
                occupied ? "bg-white shadow-sm" : "bg-black/5"
              }`}
            >
              {occupied && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/counters/${round.counter}.png`}
                  alt=""
                  width={120}
                  height={120}
                  data-testid="counter"
                  className="h-full w-full object-contain p-[10%]"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
