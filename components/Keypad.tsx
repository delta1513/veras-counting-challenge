"use client";

/**
 * Number keys laid out in the same shape as the grid above them: 1–9 in a 3x3
 * block (the same order as the dial pad on a phone), 1–24 in a 6x4 block.
 */
export default function Keypad({
  total,
  columns,
  disabled,
  onPress,
  locked,
}: {
  /** The keys run from 1 up to this number. */
  total: number;
  columns: number;
  /** Numbers already tried and wrong for this round. */
  disabled: ReadonlySet<number>;
  onPress: (value: number) => void;
  /** True while an overlay is up, so stray taps do nothing. */
  locked: boolean;
}) {
  const compact = total > 9;

  return (
    <div
      data-testid="keypad"
      className={`mx-auto grid w-full shrink-0 gap-1.5 roomy:gap-2.5 spacious:gap-3 ${
        compact ? "spacious:max-w-3xl" : "max-w-xs roomy:max-w-md"
      }`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: total }, (_, index) => {
        const value = index + 1;
        const isDisabled = disabled.has(value);
        return (
          <button
            key={value}
            type="button"
            data-testid={`key-${value}`}
            data-disabled={isDisabled ? "true" : "false"}
            aria-label={String(value)}
            disabled={isDisabled || locked}
            onClick={() => onPress(value)}
            className={[
              "rounded-xl font-bold shadow-sm active:translate-y-0.5",
              compact
                ? "h-12 text-xl roomy:h-16 roomy:text-3xl spacious:h-14"
                : "h-16 text-3xl roomy:h-20 roomy:text-5xl spacious:h-[4.5rem]",
              isDisabled
                ? "bg-[#c9c2b8] text-[#8b8478]"
                : "bg-white text-[color:var(--color-ink)]",
            ].join(" ")}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
