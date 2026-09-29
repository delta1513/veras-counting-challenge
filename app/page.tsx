"use client";

import { useState } from "react";
import Game from "@/components/Game";
import Landing from "@/components/Landing";
import type { Difficulty } from "@/lib/types";

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  if (!difficulty) return <Landing onStart={setDifficulty} />;

  // Keying on difficulty resets all game state when a new game is started.
  return (
    <Game
      key={difficulty}
      difficulty={difficulty}
      onHome={() => setDifficulty(null)}
    />
  );
}
