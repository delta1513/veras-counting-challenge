"use client";

import Overlay, { BigButton } from "./Overlay";
import { HomeIcon, RestartIcon, SadFaceIcon } from "./icons";

export default function FailOverlay({
  onRestart,
  onHome,
}: {
  onRestart: () => void;
  onHome: () => void;
}) {
  return (
    <Overlay testId="overlay-fail" tint="rgba(214, 69, 69, 0.96)">
      <SadFaceIcon className="animate-pop h-32 w-32" />

      <div className="flex items-center gap-6">
        <BigButton
          testId="btn-restart"
          label="try again"
          icon={<RestartIcon className="h-12 w-12" />}
          onClick={onRestart}
          className="border-[#d9a11e] bg-[color:var(--color-honey)]"
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
