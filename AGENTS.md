<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# About this project

Vera's Counting Challenge is a counting game for one person: Vera. It is a static Next.js site. It has no server and no API calls. It is a sibling of Vera's Spelling Bee (`delta1513/veras-spelling-bee`). The two apps share the same look, the same rules, and the same tooling. When you are unsure how something should look or work, do what the Spelling Bee does.

## Who Vera is

Vera is a stroke survivor. She was born in the 1960s. She did not grow up with technology, so her knowledge of it is limited. She is the main user of every system in this project.

Vera has these limits:

- She cannot use her right hand. She uses one hand only.
- She cannot read written text, except simple single words. She can connect one word to one object or one action.
- She cannot understand a sentence.
- She cannot speak, except a few simple, practiced words and sounds.
- She cannot say some letters of the alphabet. She can say most of them.

Vera depends on visual cues. She uses them to remember a flow in a user interface. She also uses them to understand a situation and to connect a word to an object or action.

Vera can do these things:

- She can copy text with the QWERTY keyboard on her phone, if the text is on the screen. If the screen shows "Banana", she can type "Banana".
- She can follow a complex flow after someone teaches her. For example, she learned to touch and hold text to start text-to-speech on her Apple phone.
- She knows some apps after instruction: messages, phone, contacts, Facebook, and WhatsApp.

She plays on an iPad, mostly in landscape. She sometimes plays on a phone. A support worker may sit with her.

## Rules for every change

Vera cannot understand text. Therefore, think about her limits before you add or change any feature. For example, do not add an alert pop-up, because she cannot read it. Use buttons with images or emojis that show the action.

You must obey these rules:

- Do not add sentences, instructions, labels, or error messages to the UI.
- Do not use `alert`, `confirm`, `prompt`, or a text dialog.
- Show each action with an emoji, an icon, a picture, or a color.
- Keep each flow short, and keep it the same every time. Vera learns a flow by memory.
- Make each touch target large.
- Make sure that one hand can reach every control on a phone or an iPad.
- Do not require speech, and do not require a gesture that needs two hands.
- Do not require a complex gesture, such as a pinch or a drag, unless Vera can learn it.
- If a word appears, it must be a single simple word that has a picture next to it.
- Show what happened with a clear visual result, for example a trophy or a sad face.
- Do not remove or rename a control that Vera already knows, unless there is a strong reason.
- Do not assume that Vera knows a common web pattern. Menus, swipes, and hidden controls can confuse her.
- If a new feature needs text to work, change the design. Do not add the text.

There is one exception, and it is small. A support worker may sit with Vera, so each game shows the title **"How many?"** at the top of the game screen. It tells the support worker what the goal of the game is. Vera does not need to read it, and nothing in the game may depend on her reading it. Do not add other text for the support worker without asking. The `README.md` is the place for explanations.

Before you finish, ask this question: "Can Vera use this feature with one hand, without reading?" If the answer is no, change the feature.

## How the game works

The game shows a grid of pictures of one kind of object, for example bees. The player counts them and taps the matching number on the number keys at the bottom of the screen.

- The title "How many?" is at the top of the game screen. See the exception above.
- A round picks a random number, picks one random counter, and places that many copies of the counter on the grid. Every grid cell holds at most one counter. The cells are random.
- A right number shows a green check, the number, and the counter. A button moves to the next round.
- A wrong number turns its key gray for the rest of the round. It costs one life.
- Every round starts with 3 lives.
- If lives reach zero, the game shows a sad face and a restart button.
- If the player finishes all rounds, the game shows a trophy.
- Two rounds in a row never use the same number or the same counter.

The game has two difficulty levels. The table shows the values.

| Difficulty | Rounds | Grid (columns x rows) | Keys | Numbers asked | Lives |
| --- | --- | --- | --- | --- | --- |
| Easy | 10 | 3 x 3 | 1 to 9, in a 3 x 3 block | 1 to 9 | 3 for each round |
| Medium | 10 | 6 x 4 | 1 to 24, in a 6 x 4 block | 1 to 24 | 3 for each round |

More difficulty levels will come later. Put the values in `DIFFICULTIES` in `lib/counting.ts`, not in a component.

Add `?seed=<number>` to the URL to fix the whole game: the numbers, the counters, and the cells. The tests use it.

## Layout of the screen

Vera uses an iPad in landscape, so that is the layout to protect. The phone layout must also work.

- The game screen is exactly one screen high (`h-dvh`). The header, the grid, and the keys must all fit without scrolling on a phone in portrait, an iPad in portrait, and an iPad in landscape. There are tests for this.
- The grid takes the largest size that fits between the header and the keys, and it keeps its shape (3 x 3 or 6 x 4). It uses CSS container query units (`cqw`, `cqh`) on the `CounterGrid` wrapper. This only works while the game screen has a definite height. Do not change `h-dvh` back to `min-h-dvh`.
- Screen sizes are handled by two Tailwind variants in `app/globals.css`: `roomy` (an iPad in portrait and up) and `spacious` (an iPad in landscape and up). A phone in landscape is wide but short, so it does not get either variant.

## Project layout

- `app/`: Next.js entry files (`page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico`).
- `components/`: UI parts. `Game.tsx` holds the game state. `CounterGrid.tsx` and `Keypad.tsx` draw the screen. `Landing.tsx` is the difficulty picker. The overlay files (`Overlay.tsx`, `SuccessOverlay.tsx`, `FailOverlay.tsx`, `RoundComplete.tsx`) draw the end states. `icons.tsx` holds the icons.
- `lib/counting.ts`: the list of counters, the difficulty settings, and the round generator.
- `lib/types.ts`: shared types.
- `data/counters.json`: maps each counter to an ARASAAC picture id.
- `public/counters/`: the picture for each counter. They are served from this site.
- `scripts/fetch-pictograms.mjs`: records how the pictures were chosen. It is not part of the build.
- `e2e/game.spec.ts`: Playwright tests.
- `wrangler.jsonc`: the Cloudflare Workers settings.
- `.claude/skills/add-counter/SKILL.md`: the procedure to add or change a counter. Read it before you change a counter or a picture.

## Commands

- `npm run dev`: start the dev server at `http://localhost:3000`.
- `npm run build`: make the static site in `out/`.
- `npm run lint`: run ESLint.
- `npm run typecheck`: run the TypeScript compiler.
- `npm run test:e2e`: build, serve `out/`, and run the Playwright tests. If Playwright cannot find its browser, set `CHROMIUM_PATH` to the path of an installed Chromium.
- `npm run cf:preview`: build and run the site locally in the Cloudflare Workers runtime.
- Do not deploy by hand. See the next section.

## Hosting

The site is a static export (`output: "export"` in `next.config.ts`). It is served by a Cloudflare Worker that has static assets only and no Worker code. `wrangler.jsonc` sends the `out/` folder to the Worker.

The Cloudflare GitHub app builds and deploys the site each time a push reaches `main`. The build command is `npm run build`. Do not run `wrangler deploy` by hand, and do not add a deploy script.

Everything must stay static. Do not add API routes, server actions, middleware, or any runtime call to another host. The tests check that no picture comes from another host.

## Tests

The Playwright tests run against the real static export, at the size of a Pixel 7 phone unless a test sets its own size. Some tests also check the iPad sizes. They cover the flows, the game rules, the round generator, the pictures, and the layout. When you change a rule, change the test in the same commit. Keep the test that checks that the UI has no `alert`, `confirm`, or `prompt`.

## Pictures

The picture is the full meaning of the counter for Vera. Each picture must show one clear object that Vera can name at a glance. It must not contain text. The picture must show only one object: no second object next to it, and no pair or bunch. If it does, the player cannot tell what to count. The pictures come from ARASAAC. The license is Creative Commons BY-NC-SA. Keep the credit to ARASAAC in `README.md` and on the landing screen.

Prefer objects that naturally come in numbers, such as bees, apples, and flowers.
