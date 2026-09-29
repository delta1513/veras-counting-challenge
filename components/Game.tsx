"use client";

import { useCallback, useMemo, useState } from "react";
import type { Difficulty, Round } from "@/lib/types";
import { DIFFICULTIES, buildRounds, cellCount } from "@/lib/counting";
import CounterGrid from "./CounterGrid";
import FailOverlay from "./FailOverlay";
import Keypad from "./Keypad";
import RoundComplete from "./RoundComplete";
import SuccessOverlay from "./SuccessOverlay";
import { HeartIcon, HomeIcon } from "./icons";

type Phase = "playing" | "roundWon" | "gameComplete" | "gameOver";

interface State {
  /** This game's rounds, in the order they will be played. */
  rounds: Round[];
  roundIndex: number;
  wrongNumbers: number[];
  lives: number;
  phase: Phase;
}

/**
 * `?seed=<number>` fixes the rounds so a game can be replayed exactly. The
 * end-to-end tests rely on it; ordinary play leaves it off and gets a
 * genuinely random game.
 */
function seedFromUrl(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = new URLSearchParams(window.location.search).get("seed");
  if (raw === null) return undefined;
  const seed = Number(raw);
  return Number.isFinite(seed) ? seed : undefined;
}

function startGame(difficulty: Difficulty): State {
  return {
    rounds: buildRounds(difficulty, seedFromUrl()),
    roundIndex: 0,
    wrongNumbers: [],
    lives: DIFFICULTIES[difficulty].lives,
    phase: "playing",
  };
}

export default function Game({
  difficulty,
  onHome,
}: {
  difficulty: Difficulty;
  onHome: () => void;
}) {
  const config = DIFFICULTIES[difficulty];
  const [state, setState] = useState<State>(() => startGame(difficulty));
  const [shake, setShake] = useState(false);

  const round = state.rounds[state.roundIndex];
  const wrongNumbers = useMemo(
    () => new Set(state.wrongNumbers),
    [state.wrongNumbers],
  );

  const handlePress = useCallback(
    (value: number) => {
      const wrong = state.phase === "playing" && value !== round.count;

      setState((previous) => {
        if (previous.phase !== "playing") return previous;

        if (value === previous.rounds[previous.roundIndex].count) {
          return { ...previous, phase: "roundWon" };
        }

        if (previous.wrongNumbers.includes(value)) return previous;

        const lives = previous.lives - 1;
        return {
          ...previous,
          wrongNumbers: [...previous.wrongNumbers, value],
          lives,
          phase: lives <= 0 ? "gameOver" : "playing",
        };
      });

      if (wrong) {
        setShake(true);
        window.setTimeout(() => setShake(false), 350);
      }
    },
    [state.phase, round.count],
  );

  const handleNext = useCallback(() => {
    setState((previous) => {
      const nextIndex = previous.roundIndex + 1;
      if (nextIndex >= previous.rounds.length) {
        return { ...previous, phase: "gameComplete" };
      }
      return {
        ...previous,
        roundIndex: nextIndex,
        wrongNumbers: [],
        // Every round starts with a full set of lives.
        lives: config.lives,
        phase: "playing",
      };
    });
  }, [config.lives]);

  const handleRestart = useCallback(() => {
    setState(startGame(difficulty));
  }, [difficulty]);

  return (
    <main className="mx-auto flex h-dvh min-h-[32rem] w-full max-w-md flex-col gap-3 px-3 py-3 roomy:max-w-3xl roomy:gap-4 roomy:px-6 spacious:max-w-5xl spacious:gap-2 spacious:py-2">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <button
          type="button"
          data-testid="btn-home"
          aria-label="home"
          onClick={onHome}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm active:translate-y-0.5 roomy:h-16 roomy:w-16"
        >
          <HomeIcon className="h-7 w-7 roomy:h-10 roomy:w-10" />
        </button>

        {/* For whoever is helping: this is what the game is asking. */}
        <h1
          data-testid="title"
          className="text-center text-3xl font-black tracking-tight text-[color:var(--color-ink)] roomy:text-5xl"
        >
          How many?
        </h1>

        <div
          className="flex shrink-0 gap-1 roomy:gap-2"
          data-testid="lives"
          data-lives={state.lives}
        >
          {Array.from({ length: config.lives }, (_, index) => (
            <HeartIcon
              key={index}
              full={index < state.lives}
              className="h-8 w-8 roomy:h-11 roomy:w-11"
            />
          ))}
        </div>
      </header>

      <div
        className="flex shrink-0 flex-wrap justify-center gap-1.5"
        data-testid="progress"
        data-progress={state.roundIndex}
        aria-hidden="true"
      >
        {state.rounds.map((_, index) => (
          <span
            key={index}
            data-testid={`progress-dot-${index}`}
            data-done={index < state.roundIndex ? "true" : "false"}
            className={`h-2.5 w-2.5 rounded-full ${
              index < state.roundIndex
                ? "bg-[color:var(--color-go)]"
                : index === state.roundIndex
                  ? "bg-[color:var(--color-honey-deep)]"
                  : "bg-black/15"
            }`}
          />
        ))}
      </div>

      <CounterGrid
        round={round}
        columns={config.columns}
        rows={config.rows}
        shake={shake && state.phase === "playing"}
      />

      <Keypad
        total={cellCount(difficulty)}
        columns={config.columns}
        disabled={wrongNumbers}
        onPress={handlePress}
        locked={state.phase !== "playing"}
      />

      {state.phase === "roundWon" && (
        <SuccessOverlay
          count={round.count}
          counter={round.counter}
          onNext={handleNext}
        />
      )}
      {state.phase === "gameOver" && (
        <FailOverlay onRestart={handleRestart} onHome={onHome} />
      )}
      {state.phase === "gameComplete" && (
        <RoundComplete onReplay={handleRestart} onHome={onHome} />
      )}
    </main>
  );
}
