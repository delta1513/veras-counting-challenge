---
name: add-counter
description: Add a new counter pictogram to Vera's Counting Challenge, or replace the image of an existing counter. Use when asked to add, remove, or swap a counter, change a picture, or extend the list of things Vera counts.
---

# Adding a counter to Vera's Counting Challenge

Read `AGENTS.md` first. Vera cannot read, so the picture is the whole meaning. A
counter is the small picture that is repeated on the grid; she counts copies of
it.

## What makes an acceptable counter

- **One whole object, alone.** The picture must not show a second object beside
  it. Reject a fruit drawn together with a slice of the same fruit, a pair, a
  bunch, or an object with a prop. These make "how many?" ambiguous. Examples
  already rejected: watermelon (2557), balloon (2408), two-banana bunch (2530).
- **Readable at small size.** On the medium grid the picture is about 50 px wide
  on a phone. It needs a bold outline, a clear silhouette, and solid colour.
- **Unambiguous at a glance.** If a person seeing the picture cold might say a
  different noun, it is wrong.
- **No text, letters, numbers, or symbols** in the image.
- **No people.** Choose things, animals, and plants.
- **Different from the others.** Do not add a counter that looks like an
  existing one (for example a second yellow bird).
- **Prefer things that come in numbers**: insects, fruit, flowers, animals.
- The picture must not have a black background and must not be a photo. Prefer
  ARASAAC's coloured, hand-drawn pictograms. Never use `violence: true` or
  `sex: true`.

## Process

1. Search the ARASAAC API (no key needed):

   ```bash
   curl -s "https://api.arasaac.org/v1/pictograms/en/bestsearch/WORD"
   ```

   Beware homonyms (`orange` is a fruit and a colour). Use `tags` and
   `categories`, not the id alone.

2. **Look at the picture.** Download it and open it with the Read tool before
   you choose it. The metadata often disagrees with the drawing.

   ```bash
   curl -s "https://api.arasaac.org/v1/pictograms/ID?download=false&resolution=500" -o /tmp/candidate.png
   ```

3. Wire it in, in this order:
   1. `scripts/fetch-pictograms.mjs`: add `name: id` to the `COUNTERS` map. The
      name is lowercase a to z, one word.
   2. Run `node scripts/fetch-pictograms.mjs`. It downloads the PNGs into
      `public/counters/` and rewrites `data/counters.json`. Never edit
      `data/counters.json` by hand.
   3. `lib/counting.ts`: add the name to `COUNTERS`, in alphabetical order.
   4. Commit the PNG. The app must never call ARASAAC at runtime.

4. Verify: run `npm run test:e2e`. It checks that every counter has a file, that
   files are served from this host, and that all counters appear in play.
   Then look at the counter on the medium grid at phone width.

## Things not to do

- Do not use an emoji, an icon, or an AI-generated image instead of a
  pictogram. The set has one visual language.
- Do not add text or a label to explain a weak picture.
- Do not hotlink `api.arasaac.org` from the app.
