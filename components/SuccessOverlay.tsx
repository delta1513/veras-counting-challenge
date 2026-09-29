"use client";

import Overlay, { BigButton } from "./Overlay";
import { CheckIcon, PlayIcon } from "./icons";

export default function SuccessOverlay({
  count,
  counter,
  onNext,
}: {
  count: number;
  counter: string;
  onNext: () => void;
}) {
  return (
    <Overlay testId="overlay-success" tint="rgba(53, 177, 74, 0.96)">
      <CheckIcon className="animate-pop h-28 w-28" />

      {/* The number and the thing it was the number of, side by side. */}
      <div className="flex items-center gap-4">
        <p
          data-testid="answer"
          className="text-8xl font-black text-white tabular-nums"
        >
          {count}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/counters/${counter}.png`}
          alt=""
          width={140}
          height={140}
          className="h-32 w-32 rounded-2xl bg-white object-contain p-1"
        />
      </div>

      <BigButton
        testId="btn-next"
        label="next"
        icon={<PlayIcon className="h-12 w-12" />}
        onClick={onNext}
        className="border-[#d9a11e] bg-[color:var(--color-honey)]"
      />
    </Overlay>
  );
}
