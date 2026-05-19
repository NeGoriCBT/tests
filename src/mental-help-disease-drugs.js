/**
 * Каталог препаратов и подсказки для анамнеза заболевания.
 */
import { DISEASE_DRUG_CATALOG } from "./mental-help-disease-drugs-catalog.js";

export { DISEASE_DRUG_CATALOG };

/** @type {Map<string, { molecule: string; brands: string }>} */
const drugById = new Map();
for (const g of DISEASE_DRUG_CATALOG) {
  for (const d of g.drugs) drugById.set(d.id, d);
}

/** @returns {string[]} */
export function allDiseaseDrugIds() {
  return [...drugById.keys()];
}

/** @param {string} id */
export function drugIdToMolecule(id) {
  return drugById.get(id)?.molecule ?? id;
}

/** @param {string} id @param {boolean} [compact] */
export function drugIdToPickerLabel(id, compact = false) {
  const d = drugById.get(id);
  if (!d) return id;
  if (compact) return d.molecule;
  const brands = String(d.brands ?? "").trim();
  return brands ? `${d.molecule} (${brands})` : d.molecule;
}

/** @type {Array<{ id: string; label: string; search: string }> | null} */
let drugPickerEntriesCache = null;

/** @returns {Array<{ id: string; label: string; search: string }>} */
export function getDrugPickerEntries() {
  if (drugPickerEntriesCache) return drugPickerEntriesCache;
  drugPickerEntriesCache = [];
  for (const g of DISEASE_DRUG_CATALOG) {
    for (const d of g.drugs) {
      const label = drugIdToPickerLabel(d.id);
      const search = `${d.molecule} ${d.brands}`.toLowerCase();
      drugPickerEntriesCache.push({ id: d.id, label, search });
    }
  }
  return drugPickerEntriesCache;
}

/**
 * @param {string} query
 * @param {Set<string>} excludeIds
 * @param {number} [limit]
 */
export function filterDrugPickerSuggestions(query, excludeIds, limit = 24) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return [];
  return getDrugPickerEntries()
    .filter((e) => !excludeIds.has(e.id) && e.search.includes(q))
    .slice(0, limit)
    .map((e) => e.label);
}

/** @param {string} label */
export function drugLabelToId(label) {
  const norm = String(label ?? "").trim();
  const hit = getDrugPickerEntries().find((e) => e.label === norm || e.label.startsWith(`${norm} (`));
  if (hit) return hit.id;
  const byMol = getDrugPickerEntries().find((e) => drugIdToMolecule(e.id).toLowerCase() === norm.toLowerCase());
  return byMol ? byMol.id : null;
}

/** @param {string} id */
export function drugIdToLabel(id) {
  return drugIdToPickerLabel(id, true);
}
