/**
 * Парсит reference/early-symptoms-v2-raw.txt → src/mental-help-disease-early-symptoms-catalog.js
 * Заголовок секции: «1. Название (ок. N жалоб)»
 * Строки жалоб — без номера, не пустые.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "reference/early-symptoms-v2-raw.txt");
const OUT = path.join(ROOT, "src/mental-help-disease-early-symptoms-catalog.js");

const SECTION_RE = /^\d+\.\s+(.+?)\s*\(ок\.\s*\d+\s*жалоб\)\s*$/i;

/** @type {Array<{ title: string; items: string[] }>} */
const groups = [];
/** @type {string[]} */
let currentItems = [];
let currentTitle = "";

for (const rawLine of fs.readFileSync(RAW, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line) continue;
  const sec = line.match(SECTION_RE);
  if (sec) {
    if (currentTitle && currentItems.length) {
      groups.push({ title: currentTitle, items: currentItems });
    }
    currentTitle = sec[1].trim();
    currentItems = [];
    continue;
  }
  if (!currentTitle) continue;
  let item = line;
  if (item.includes("- ") && !item.includes("—")) {
    const parts = item.split(/\s*-\s+/);
    if (parts.length === 2 && parts[0].length > 3 && parts[1].length > 2) {
      currentItems.push(parts[0].trim());
      item = parts[1].trim();
    }
  }
  currentItems.push(item);
}
if (currentTitle && currentItems.length) {
  groups.push({ title: currentTitle, items: currentItems });
}

const deduped = groups.map((g) => {
  const seen = new Set();
  const items = [];
  for (const it of g.items) {
    const t = it.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    items.push(t);
  }
  return { title: g.title, items };
});

let total = 0;
for (const g of deduped) total += g.items.length;

const body =
  `/**\n * Автогенерация: node scripts/build-early-symptoms-v2-catalog.mjs\n * Источник: reference/early-symptoms-v2-raw.txt\n * Всего жалоб: ${total}\n */\n` +
  `/** @type {ReadonlyArray<{ title: string; items: readonly string[] }>} */\n` +
  `export const EARLY_SYMPTOMS_CATALOG = ${JSON.stringify(deduped, null, 2)};\n`;

fs.writeFileSync(OUT, body, "utf8");
console.log(`Wrote ${OUT}: ${deduped.length} sections, ${total} items`);
