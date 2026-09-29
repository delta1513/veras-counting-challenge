#!/usr/bin/env node
// Reproducibility script — NOT part of the build.
// Downloads the selected ARASAAC pictograms into public/counters/
// and rewrites data/counters.json.
//
// Usage: node scripts/fetch-pictograms.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = join(ROOT, "public", "counters");
const DATA_FILE = join(ROOT, "data", "counters.json");
const RESOLUTION = 500;

// counter -> ARASAAC pictogram id. Hand-picked: one whole object, alone, that
// Vera can name at a glance, and that naturally comes in numbers.
//
// Rejected on purpose: watermelon (2557) and balloon (2408) draw a second
// object next to the first, which would make "how many?" ambiguous; the
// two-banana bunch (2530) for the same reason.
const COUNTERS = {
  apple: 2462,
  banana: 10218,
  bee: 2239,
  butterfly: 2465,
  dog: 2517,
  duck: 2563,
  flower: 3102,
  frog: 2543,
  icecream: 2420,
  ladybug: 2924,
  pear: 2561,
  strawberry: 2400,
};

const ATTRIBUTION = {
  author: "Sergio Palao",
  origin: "ARASAAC (http://arasaac.org)",
  owner: "Gobierno de Aragon",
  license: "CC BY-NC-SA 4.0",
};

async function download(name, id) {
  const url = `https://api.arasaac.org/v1/pictograms/${id}?download=false&resolution=${RESOLUTION}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name} (${id}): HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000 || buf.readUInt32BE(0) !== 0x89504e47) {
    throw new Error(`${name} (${id}): not a valid PNG (${buf.length} bytes)`);
  }
  await writeFile(join(IMAGE_DIR, `${name}.png`), buf);
  console.log(`ok  ${name.padEnd(10)} ${id}  ${buf.length} bytes`);
}

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(dirname(DATA_FILE), { recursive: true });

  for (const [name, id] of Object.entries(COUNTERS)) {
    await download(name, id);
  }

  const counters = {};
  for (const [name, id] of Object.entries(COUNTERS)) {
    counters[name] = { id };
  }

  await writeFile(
    DATA_FILE,
    JSON.stringify({ attribution: ATTRIBUTION, counters }, null, 2) + "\n",
  );
  console.log(`wrote ${DATA_FILE}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
