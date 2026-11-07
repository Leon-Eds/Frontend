// Checks every marketing dictionary against English: same keys, same inline tags, same {placeholders}.
// usage: node scripts/check-marketing-i18n.mjs
import { readFileSync, readdirSync } from "node:fs";

const dir = new URL("../src/i18n/marketing/", import.meta.url);

// Pull "key": "value" pairs out of a dictionary source file
const parse = (src) => Object.fromEntries([...src.matchAll(/^\s*"(mk\.[^"]+)":\s*("(?:[^"\\]|\\.)*")/gm)].map((m) => [m[1], JSON.parse(m[2])]));

const en = Object.assign(
  {},
  ...readdirSync(new URL("en/", dir))
    .filter((f) => f !== "index.ts")
    .map((f) => parse(readFileSync(new URL(`en/${f}`, dir), "utf8")))
);

const markers = (s) => [...s.matchAll(/<\/?\w+>|\{\w+\}/g)].map((m) => m[0]).sort().join(" ");

let failed = false;
for (const file of readdirSync(dir).filter((f) => /^[a-z]{2}\.ts$/.test(f))) {
  const dict = parse(readFileSync(new URL(file, dir), "utf8"));
  const problems = [];
  for (const key of Object.keys(en)) {
    if (!(key in dict)) problems.push(`missing ${key}`);
    else if (markers(en[key]) !== markers(dict[key])) problems.push(`markup differs in ${key}: "${dict[key]}"`);
  }
  for (const key of Object.keys(dict)) if (!(key in en)) problems.push(`unknown key ${key}`);
  console.log(`${file}: ${Object.keys(dict).length}/${Object.keys(en).length} keys${problems.length ? `, ${problems.length} problem(s)` : ", ok"}`);
  problems.forEach((p) => console.log("  " + p));
  failed ||= problems.length > 0;
}
process.exit(failed ? 1 : 0);
