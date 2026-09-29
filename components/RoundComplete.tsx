"use client";

import Overlay, { BigButton } from "./Overlay";
import { HomeIcon, RestartIcon, TrophyIcon } from "./icons";

export default function RoundComplete({
  onReplay,
  onHome,
}: {
  onReplay: () => void;
  onHome: () => void;
}) {
  return (
    <Overlay testId="overlay-round-complete" tint="rgba(255, 200, 61, 0.97)">
      <TrophyIcon className="animate-pop h-36 w-36" />

      <div className="flex items-center gap-6">
        <BigButton
          testId="btn-replay"
          label="play again"
          icon={<RestartIcon className="h-12 w-12" />}
          onClick={onReplay}
          className="border-[#3f9c50] bg-[color:var(--color-go)]"
        />
        <BigButton
          testId="btn-home-overlay"
          label="home"
          icon={<HomeIcon className="h-12 w-12" />}
          onClick={onHome}
          className="border-[#cfc6b6] bg-white"
        />
      </div>
    </Overlay>
  );
}
