import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  COUNTERS,
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  buildRound,
  buildRounds,
  cellCount,
} from "../lib/counting";
import type { Difficulty } from "../lib/types";

/**
 * The game is random in normal play, so the tests pin it with `?seed=`.
 * Everything else here still reads the answer off the page — by counting the
 * pictograms, the way a player would — rather than assuming what came up.
 */
async function start(page: Page, difficulty: Difficulty, seed = 1) {
  await page.goto(`/?seed=${seed}`);
  await page.getByTestId(`difficulty-${difficulty}`).click();
  await expect(page.getByTestId("grid")).toBeVisible();
}

/** How many counters are on the grid right now: the right answer. */
function countOnScreen(page: Page): Promise<number> {
  return page.getByTestId("counter").count();
}

/** Press the key for the right answer. */
async function answerCorrectly(page: Page) {
  await page.getByTestId(`key-${await countOnScreen(page)}`).click();
}

/** Play a whole game, collecting the answers in the order they came up. */
async function playGame(page: Page, difficulty: Difficulty): Promise<number[]> {
  const answers: number[] = [];
  for (let i = 0; i < DIFFICULTIES[difficulty].rounds; i++) {
    answers.push(await countOnScreen(page));
    await answerCorrectly(page);
    await page.getByTestId("btn-next").click();
  }
  return answers;
}

/** The lowest numbers that are not the answer, `count` of them. */
function wrongNumbers(answer: number, total: number, count: number): number[] {
  return Array.from({ length: total }, (_, i) => i + 1)
    .filter((n) => n !== answer)
    .slice(0, count);
}

function livesLeft(page: Page) {
  return page.getByTestId("lives").getAttribute("data-lives");
}

/** Whether the page has to scroll in either direction. */
function overflow(page: Page) {
  return page.evaluate(() => ({
    vertical: document.documentElement.scrollHeight > window.innerHeight,
    horizontal: document.documentElement.scrollWidth > window.innerWidth,
  }));
}

test.describe("landing", () => {
  test("shows easy and medium, and each starts a game straight away", async ({
    page,
  }) => {
    await page.goto("/?seed=1");
    for (const difficulty of DIFFICULTY_ORDER) {
      await expect(page.getByTestId(`difficulty-${difficulty}`)).toBeVisible();
    }

    await page.getByTestId("difficulty-easy").click();
    await expect(page.getByTestId("grid")).toBeVisible();
    await expect(page.getByTestId("keypad")).toBeVisible();
  });

  test("keeps the ARASAAC credit", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("ARASAAC")).toBeVisible();
  });
});

test.describe("every game", () => {
  for (const difficulty of DIFFICULTY_ORDER) {
    test(`${difficulty}: the title asks "How many?" for whoever is helping`, async ({
      page,
    }) => {
      await start(page, difficulty);
      await expect(
        page.getByRole("heading", { level: 1, name: "How many?" }),
      ).toBeVisible();

      // ...and it is still there on the next round.
      await answerCorrectly(page);
      await page.getByTestId("btn-next").click();
      await expect(page.getByTestId("title")).toHaveText("How many?");
      await expect(page.getByTestId("title")).toBeInViewport();
    });
  }
});

test.describe("easy", () => {
  test("has a 3x3 grid, keys 1 to 9 and three lives", async ({ page }) => {
    await start(page, "easy");

    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(9);
    await expect(page.getByTestId("grid")).toHaveAttribute("data-columns", "3");
    await expect(page.getByTestId("grid")).toHaveAttribute("data-rows", "3");

    await expect(page.locator('[data-testid^="key-"]')).toHaveCount(9);
    for (let n = 1; n <= 9; n++) {
      await expect(page.getByTestId(`key-${n}`)).toHaveText(String(n));
    }
    expect(await livesLeft(page)).toBe("3");
    await expect(page.locator('[data-testid^="progress-dot-"]')).toHaveCount(
      10,
    );
  });

  test("puts 1 to 9 of one kind of counter on the grid, one per cell", async ({
    page,
  }) => {
    for (const seed of [1, 2, 3, 4, 5]) {
      await start(page, "easy", seed);
      const counters = page.getByTestId("counter");
      const answer = await counters.count();
      expect(answer).toBeGreaterThanOrEqual(1);
      expect(answer).toBeLessThanOrEqual(9);

      // No cell holds more than one, and every counter sits in a cell.
      const perCell = await page
        .locator('[data-testid^="cell-"]')
        .evaluateAll((cells) =>
          cells.map((cell) => cell.querySelectorAll("img").length),
        );
      expect(Math.max(...perCell)).toBeLessThanOrEqual(1);
      expect(perCell.reduce((a, b) => a + b, 0)).toBe(answer);

      // They are all the same counter, and it is one from the list.
      const sources = new Set(
        await counters.evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("src")),
        ),
      );
      expect(sources.size).toBe(1);
      const counter = await page
        .getByTestId("grid")
        .getAttribute("data-counter");
      expect(COUNTERS).toContain(counter);
      expect([...sources][0]).toBe(`/counters/${counter}.png`);
    }
  });
});

test.describe("medium", () => {
  test("has a 6x4 grid, keys 1 to 24 and three lives", async ({ page }) => {
    await start(page, "medium");

    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(24);
    await expect(page.getByTestId("grid")).toHaveAttribute("data-columns", "6");
    await expect(page.getByTestId("grid")).toHaveAttribute("data-rows", "4");

    await expect(page.locator('[data-testid^="key-"]')).toHaveCount(24);
    await expect(page.getByTestId("key-24")).toHaveText("24");
    expect(await livesLeft(page)).toBe("3");
  });

  test("puts 1 to 24 counters on the grid, one per cell", async ({ page }) => {
    for (const seed of [1, 2, 3, 4, 5]) {
      await start(page, "medium", seed);
      const answer = await countOnScreen(page);
      expect(answer).toBeGreaterThanOrEqual(1);
      expect(answer).toBeLessThanOrEqual(24);

      const perCell = await page
        .locator('[data-testid^="cell-"]')
        .evaluateAll((cells) =>
          cells.map((cell) => cell.querySelectorAll("img").length),
        );
      expect(Math.max(...perCell)).toBeLessThanOrEqual(1);
      expect(perCell.reduce((a, b) => a + b, 0)).toBe(answer);
    }
  });

  test("a whole game can be won", async ({ page }) => {
    await start(page, "medium");
    await playGame(page, "medium");
    await expect(page.getByTestId("overlay-round-complete")).toBeVisible();
  });
});

test.describe("answering", () => {
  test("the right number shows the success overlay with the answer, then moves on", async ({
    page,
  }) => {
    await start(page, "easy");
    await expect(page.getByTestId("progress")).toHaveAttribute(
      "data-progress",
      "0",
    );

    const answer = await countOnScreen(page);
    await answerCorrectly(page);

    await expect(page.getByTestId("overlay-success")).toBeVisible();
    await expect(page.getByTestId("answer")).toHaveText(String(answer));

    await page.getByTestId("btn-next").click();
    await expect(page.getByTestId("overlay-success")).toBeHidden();
    await expect(page.getByTestId("progress")).toHaveAttribute(
      "data-progress",
      "1",
    );
    await expect(page.getByTestId("progress-dot-0")).toHaveAttribute(
      "data-done",
      "true",
    );
  });

  test("a wrong number greys out its key and costs exactly one life", async ({
    page,
  }) => {
    await start(page, "easy");
    const [wrong] = wrongNumbers(await countOnScreen(page), 9, 1);
    const key = page.getByTestId(`key-${wrong}`);

    expect(await livesLeft(page)).toBe("3");
    await key.click();

    await expect(key).toHaveAttribute("data-disabled", "true");
    await expect(key).toBeDisabled();
    expect(await livesLeft(page)).toBe("2");

    // Tapping it again must not cost another life.
    await key.click({ force: true });
    expect(await livesLeft(page)).toBe("2");

    // The round carries on, and no other key is greyed.
    await expect(page.getByTestId("overlay-success")).toBeHidden();
    await expect(page.getByTestId("overlay-fail")).toBeHidden();
    await expect(
      page.locator('[data-testid^="key-"][data-disabled="true"]'),
    ).toHaveCount(1);
  });

  test("a wrong key stays grey for the round, and only that round", async ({
    page,
  }) => {
    await start(page, "medium");
    const [wrong] = wrongNumbers(await countOnScreen(page), 24, 1);
    await page.getByTestId(`key-${wrong}`).click();
    await expect(page.getByTestId(`key-${wrong}`)).toBeDisabled();

    await answerCorrectly(page);
    await page.getByTestId("btn-next").click();

    // A fresh round: every key is live again.
    await expect(
      page.locator('[data-testid^="key-"][data-disabled="true"]'),
    ).toHaveCount(0);
  });

  test("lives are refilled at the start of every round", async ({ page }) => {
    await start(page, "easy");
    for (const wrong of wrongNumbers(await countOnScreen(page), 9, 2)) {
      await page.getByTestId(`key-${wrong}`).click();
    }
    expect(await livesLeft(page)).toBe("1");

    await answerCorrectly(page);
    await page.getByTestId("btn-next").click();
    expect(await livesLeft(page)).toBe("3");
  });

  test("running out of lives shows the fail screen, and restart starts over", async ({
    page,
  }) => {
    await start(page, "easy");
    for (const wrong of wrongNumbers(await countOnScreen(page), 9, 3)) {
      await page.getByTestId(`key-${wrong}`).click();
    }
    await expect(page.getByTestId("overlay-fail")).toBeVisible();
    expect(await livesLeft(page)).toBe("0");

    await page.getByTestId("btn-restart").click();
    await expect(page.getByTestId("overlay-fail")).toBeHidden();
    expect(await livesLeft(page)).toBe("3");
    await expect(page.getByTestId("progress")).toHaveAttribute(
      "data-progress",
      "0",
    );
  });

  test("answering all ten rounds shows the trophy, and play again works", async ({
    page,
  }) => {
    await start(page, "easy");
    const answers = await playGame(page, "easy");
    expect(answers).toHaveLength(10);

    await expect(page.getByTestId("overlay-round-complete")).toBeVisible();
    await page.getByTestId("btn-replay").click();
    await expect(page.getByTestId("overlay-round-complete")).toBeHidden();
    await expect(page.getByTestId("progress")).toHaveAttribute(
      "data-progress",
      "0",
    );
  });

  test("the home button returns to the landing screen mid-game", async ({
    page,
  }) => {
    await start(page, "medium");
    await page.getByTestId("btn-home").click();
    await expect(page.getByTestId("difficulty-easy")).toBeVisible();
  });
});

test.describe("randomness", () => {
  test("the same seed replays the same game", async ({ page }) => {
    await start(page, "easy", 7);
    const first = await playGame(page, "easy");

    await start(page, "easy", 7);
    const second = await playGame(page, "easy");

    expect(second).toEqual(first);
  });

  test("without a seed, games differ", async ({ page }) => {
    const layouts = new Set<string>();
    for (let attempt = 0; attempt < 6; attempt++) {
      await page.goto("/");
      await page.getByTestId("difficulty-medium").click();
      const cells = await page
        .locator('[data-occupied="true"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("data-testid")),
        );
      layouts.add(cells.join(","));
    }
    expect(layouts.size).toBeGreaterThan(1);
  });
});

test.describe("round generation", () => {
  test("every round follows the rules, for every difficulty", () => {
    const problems: string[] = [];
    const seenCounts = new Set<number>();
    const seenCounters = new Set<string>();

    for (const difficulty of DIFFICULTY_ORDER) {
      const total = cellCount(difficulty);
      for (let seed = 0; seed < 200; seed++) {
        const rounds = buildRounds(difficulty, seed);
        if (rounds.length !== DIFFICULTIES[difficulty].rounds) {
          problems.push(`${difficulty}/${seed}: ${rounds.length} rounds`);
        }
        rounds.forEach((round, index) => {
          const label = `${difficulty}/${seed}/${index}`;
          if (round.count < 1 || round.count > total) {
            problems.push(`${label}: count ${round.count}`);
          }
          if (round.cells.length !== round.count) {
            problems.push(`${label}: ${round.cells.length} cells`);
          }
          if (new Set(round.cells).size !== round.cells.length) {
            problems.push(`${label}: cell used twice`);
          }
          if (round.cells.some((cell) => cell < 0 || cell >= total)) {
            problems.push(`${label}: cell outside the grid`);
          }
          if (!(COUNTERS as readonly string[]).includes(round.counter)) {
            problems.push(`${label}: unknown counter ${round.counter}`);
          }
          const before = rounds[index - 1];
          if (
            before &&
            (before.count === round.count || before.counter === round.counter)
          ) {
            problems.push(`${label}: repeats the round before`);
          }
          if (difficulty === "easy") seenCounts.add(round.count);
          seenCounters.add(round.counter);
        });
      }
    }

    expect(problems).toEqual([]);
    // Across enough games every number from 1 to 9 and every counter turns up.
    expect([...seenCounts].sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect([...seenCounters].sort()).toEqual([...COUNTERS].sort());
  });

  test("a full grid and a single counter are both possible", () => {
    const counts = new Set<number>();
    for (let i = 0; i < 4000; i++) counts.add(buildRound("medium").count);
    expect(counts).toContain(1);
    expect(counts).toContain(24);
  });

  test("counters land in different cells from game to game", () => {
    const layouts = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const round = buildRounds("easy", seed)[0];
      layouts.add(`${round.count}:${round.cells.join(",")}`);
    }
    expect(layouts.size).toBeGreaterThan(10);
  });
});

test.describe("assets", () => {
  test("every counter has a pictogram file, served from this host", async ({
    page,
  }) => {
    const files = new Set(
      readdirSync(join(process.cwd(), "public", "counters")),
    );
    for (const counter of COUNTERS) expect(files).toContain(`${counter}.png`);

    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3100"))
        external.push(request.url());
    });

    // Play until every counter has been on screen, so each is really requested.
    const shown = new Set<string>();
    for (let seed = 1; seed < 60 && shown.size < COUNTERS.length; seed++) {
      await start(page, "easy", seed);
      for (let i = 0; i < DIFFICULTIES.easy.rounds; i++) {
        const counter = await page
          .getByTestId("grid")
          .getAttribute("data-counter");
        const image = page.getByTestId("counter").first();
        const src = await image.getAttribute("src");
        expect(src).toBe(`/counters/${counter}.png`);

        if (!shown.has(counter!)) {
          shown.add(counter!);
          const response = await page.request.get(src!);
          expect(response.status()).toBe(200);
          expect(response.headers()["content-type"]).toContain("image/png");
          // A broken image reports naturalWidth 0.
          await expect
            .poll(() =>
              image.evaluate((el: HTMLImageElement) => el.naturalWidth),
            )
            .toBeGreaterThan(0);
        }

        await answerCorrectly(page);
        await page.getByTestId("btn-next").click();
      }
    }

    expect([...shown].sort()).toEqual([...COUNTERS].sort());
    expect(external).toEqual([]);
  });
});

test.describe("rules for Vera", () => {
  test("no browser alerts or confirms anywhere in the UI", () => {
    const roots = ["app", "components", "lib"];
    const offenders: string[] = [];

    for (const root of roots) {
      const dir = join(process.cwd(), root);
      for (const entry of readdirSync(dir, {
        recursive: true,
        encoding: "utf8",
      })) {
        if (!/\.tsx?$/.test(entry)) continue;
        const source = readFileSync(join(dir, entry), "utf8");
        if (/\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/.test(source)) {
          offenders.push(`${root}/${entry}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

test.describe("layouts", () => {
  test.describe("iPad landscape", () => {
    // What Vera actually plays on: nothing may be pushed off screen, and the
    // keys must stay big enough to hit one-handed.
    test.use({ viewport: { width: 1024, height: 768 } });

    for (const difficulty of DIFFICULTY_ORDER) {
      test(`${difficulty}: the whole board fits without scrolling`, async ({
        page,
      }) => {
        await start(page, difficulty);

        expect(await overflow(page)).toEqual({
          vertical: false,
          horizontal: false,
        });

        await expect(page.getByTestId("title")).toBeInViewport();
        await expect(page.getByTestId("grid")).toBeInViewport();
        await expect(page.getByTestId("key-1")).toBeInViewport();
        await expect(
          page.getByTestId(`key-${cellCount(difficulty)}`),
        ).toBeInViewport();

        const key = await page.getByTestId("key-1").boundingBox();
        expect(key!.height).toBeGreaterThanOrEqual(48);
        expect(key!.width).toBeGreaterThanOrEqual(80);

        // The grid keeps its shape and leaves the keys clear underneath it.
        const grid = await page.getByTestId("grid").boundingBox();
        const keypad = await page.getByTestId("keypad").boundingBox();
        expect(grid!.y + grid!.height).toBeLessThanOrEqual(keypad!.y);
        const { columns, rows } = DIFFICULTIES[difficulty];
        expect(grid!.width / grid!.height).toBeCloseTo(columns / rows, 1);
      });
    }
  });

  test.describe("iPad portrait", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("medium fits without scrolling", async ({ page }) => {
      await start(page, "medium");
      expect(await overflow(page)).toEqual({
        vertical: false,
        horizontal: false,
      });
      await expect(page.getByTestId("key-24")).toBeInViewport();
    });
  });

  test("a phone in portrait fits both games without scrolling", async ({
    page,
  }) => {
    for (const difficulty of DIFFICULTY_ORDER) {
      await start(page, difficulty);
      expect(await overflow(page)).toEqual({
        vertical: false,
        horizontal: false,
      });
      await expect(
        page.getByTestId(`key-${cellCount(difficulty)}`),
      ).toBeInViewport();
    }
  });

  test("a phone in landscape never scrolls sideways", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    for (const difficulty of DIFFICULTY_ORDER) {
      await start(page, difficulty);
      expect((await overflow(page)).horizontal).toBe(false);
    }
  });
});
