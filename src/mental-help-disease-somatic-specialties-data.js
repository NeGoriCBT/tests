/**
 * Соматические специальности (вопрос 5): каталог и автодополнение.
 */
import { SOMATIC_SPECIALTIES_CATALOG } from "./mental-help-disease-somatic-specialties-catalog.js";

/** @type {string[] | null} */
let labelsCache = null;

export function getAllSomaticSpecialtyLabels() {
  if (labelsCache) return labelsCache;
  const seen = new Set();
  labelsCache = [];
  for (const g of SOMATIC_SPECIALTIES_CATALOG) {
    for (const lab of g.items) {
      if (!seen.has(lab)) {
        seen.add(lab);
        labelsCache.push(lab);
      }
    }
  }
  return labelsCache;
}

/**
 * @param {string} query
 * @param {Set<string>} exclude
 * @param {number} [limit]
 */
export function filterSomaticSpecialtySuggestions(query, exclude, limit = 20) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return [];
  return getAllSomaticSpecialtyLabels()
    .filter((lab) => !exclude.has(lab) && lab.toLowerCase().includes(q))
    .slice(0, limit);
}
