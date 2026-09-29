# Vera's Counting Challenge

A picture-led counting game. A grid shows a number of the same object — bees,
apples, flowers — and the player counts them and taps the matching number.

It is built for a player who cannot read prose: there are no sentences,
instructions, or browser dialogs anywhere in the UI. Every control is an emoji,
an icon, or a colour, touch targets are large, and the whole board is reachable
one-handed on a phone or an iPad. The one piece of text on the game screen is the
title **"How many?"**, which tells a support worker sitting with the player what
the goal is; nothing depends on the player reading it.

It is a sibling of [Vera's Spelling Bee](https://github.com/delta1513/veras-spelling-bee)
and shares its look, its rules and its tooling.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm run test:e2e   # builds, serves out/, runs the Playwright suite
npm run cf:preview # runs the built site in the Cloudflare Workers runtime
```

If Playwright cannot find its browser, point it at an installed Chromium with
`CHROMIUM_PATH=/path/to/chromium npm run test:e2e`.

`npm run build` produces a fully static site in `out/`. There are no runtime API
calls and no server.

## How the game works

| Difficulty | Rounds | Grid | Keys | Lives |
| --- | --- | --- | --- | --- |
| Easy | 10 | 3 × 3 | 1–9 | 3, refilled each round |
| Medium | 10 | 6 × 4 | 1–24 | 3, refilled each round |

Each round picks a random number (from 1 up to the number of cells), picks one
random counter, and drops that many copies of it into random, distinct cells of
the grid — a cell never holds more than one. The player taps the number they
counted.

A right answer shows a green check with the number and the counter, then moves on.
A wrong answer greys that key out for the rest of the round and costs a life.
Lives gone means a sad-face screen with a restart button; ten rounds done means a
trophy. Two rounds in a row never repeat the same number or the same counter.

Adding `?seed=<number>` to the URL fixes the whole game — numbers, counters and
cell positions — so it can be replayed exactly. The end-to-end tests use it;
ordinary play leaves it off.

## Counters

The twelve counters live in `public/counters/` and are served from this host:
apple, banana, bee, butterfly, dog, duck, flower, frog, ice cream, ladybug, pear
and strawberry. `scripts/fetch-pictograms.mjs` records how they were selected from
the ARASAAC API and can regenerate them, but it is not part of the build.
`data/counters.json` maps each counter to its ARASAAC id. To add or swap one, see
`.claude/skills/add-counter/SKILL.md`.

Pictograms are the property of the Government of Aragón and have been created by
Sergio Palao for ARASAAC (<http://arasaac.org>), which distributes them under
Creative Commons BY-NC-SA licence.

## Hosting

The site is a static export served by a Cloudflare Worker that has static assets
and no Worker code (`wrangler.jsonc` points it at `out/`). Cloudflare's GitHub app
builds it with `npm run build` and deploys it each time a push reaches `main`;
there is no deploy script to run by hand.

To connect it, create a Workers Build in the Cloudflare dashboard for this
repository (Workers & Pages → Create → Import a repository) with the build command
`npm run build` and the deploy command `npx wrangler deploy`. The Worker name must
match `name` in `wrangler.jsonc`.

## Not in this version

More difficulty levels, and audio (speaking the number as it is tapped).
