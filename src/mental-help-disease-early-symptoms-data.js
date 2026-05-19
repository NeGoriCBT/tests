/**
 * Список ранних симптомов (дебют): каталог v2, группы для UI, вывод в Word по категориям.
 * Каталог: mental-help-disease-early-symptoms-catalog.js (сборка из reference/early-symptoms-v2-raw.txt).
 */
import { EARLY_SYMPTOM_PAST_BY_LABEL } from "./mental-help-disease-early-symptoms-past.js";
import { EARLY_SYMPTOMS_CATALOG } from "./mental-help-disease-early-symptoms-catalog.js";

/** Текстовый источник для sync/docx-скриптов. */
export function buildEarlySymptomsSourceString() {
  return EARLY_SYMPTOMS_CATALOG.map((g) => [g.title, ...g.items].join("\n")).join("\n\n");
}

export const EARLY_SYMPTOMS_SOURCE = buildEarlySymptomsSourceString();

export const EARLY_SYMPTOMS_HEADINGS = new Set(EARLY_SYMPTOMS_CATALOG.map((g) => g.title));

/** @type {Array<{ title: string; items: string[] }> | null} */
let earlySymptomsGroupsCache = null;

export function getEarlySymptomsGroups() {
  if (earlySymptomsGroupsCache) return earlySymptomsGroupsCache;
  earlySymptomsGroupsCache = EARLY_SYMPTOMS_CATALOG.map((g) => ({
    title: g.title,
    items: [...g.items],
  }));
  return earlySymptomsGroupsCache;
}

/** @type {string[] | null} */
let earlySymptomsLabelsCache = null;

/** Плоский список подписей для автодополнения (порядок как в анкете). */
export function getAllEarlySymptomLabels() {
  if (earlySymptomsLabelsCache) return earlySymptomsLabelsCache;
  earlySymptomsLabelsCache = getEarlySymptomsGroups().flatMap((g) => g.items);
  return earlySymptomsLabelsCache;
}

/**
 * @param {string} query
 * @param {Set<string>} exclude
 * @param {number} [limit]
 */
export function filterEarlySymptomSuggestions(query, exclude, limit = 20) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return [];
  return getAllEarlySymptomLabels()
    .filter((lab) => !exclude.has(lab) && lab.toLowerCase().includes(q))
    .slice(0, limit);
}

/** Заголовки блоков в тексте Word и соответствующие подзаголовки из анкеты. */
export const EARLY_SYMPTOMS_WORD_BLOCKS = /** @type {const} */ ([
  { header: "настроение и эмоции", sections: ["Настроение и эмоции"] },
  { header: "тревога и страхи", sections: ["Тревога и страхи"] },
  { header: "телесные симптомы", sections: ["Телесные симптомы"] },
  { header: "нарушения сна", sections: ["Сон"] },
  { header: "нарушения аппетита и пищевого поведения", sections: ["Аппетит и пищевое поведение"] },
  { header: "когнитивные нарушения", sections: ["Память и внимание"] },
  { header: "навязчивые мысли", sections: ["Навязчивые мысли"] },
  { header: "навязчивые действия (ритуалы)", sections: ["Навязчивые действия (ритуалы)"] },
  { header: "поведенческие изменения", sections: ["Поведенческие изменения"] },
  { header: "энергия и активность", sections: ["Энергия и активность"] },
  { header: "общение с людьми", sections: ["Общение с людьми"] },
  { header: "интимная сфера", sections: ["Интимная сфера"] },
]);

/**
 * Порядок симптомов в анкете (для сортировки внутри категории).
 * @returns {Map<string, number>}
 */
function earlySymptomOrderIndex() {
  const groups = getEarlySymptomsGroups();
  /** @type {Map<string, number>} */
  const m = new Map();
  let n = 0;
  for (const g of groups) {
    for (const lab of g.items) {
      if (!m.has(lab)) m.set(lab, n++);
    }
  }
  return m;
}

/**
 * Текст для Word: ранние симптомы в прошедшем времени.
 * @param {string} earlyRaw — выбранные подписи через \n
 * @param {{ isRelapse?: boolean; sameAsPrevious?: boolean }} [opts]
 */
export function formatEarlySymptomsForWord(earlyRaw, opts = {}) {
  const { isRelapse = false, sameAsPrevious = false } = opts;
  if (sameAsPrevious) return "Симптоматика аналогична предыдущему эпизоду.";

  const selected = String(earlyRaw ?? "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!selected.length) return "";

  const order = earlySymptomOrderIndex();
  const groups = getEarlySymptomsGroups();
  /** @param {string} lab */
  function sectionTitleOf(lab) {
    for (const g of groups) {
      if (g.items.includes(lab)) return g.title;
    }
    return "";
  }

  const sorted = [...selected].sort((a, b) => (order.get(a) ?? 9999) - (order.get(b) ?? 9999));
  const phrases = sorted.map((lab) => {
    const p = EARLY_SYMPTOM_PAST_BY_LABEL[lab];
    return p ?? lab.charAt(0).toLowerCase() + lab.slice(1);
  });

  const intro = isRelapse ? "При повторном ухудшении беспокоило" : "В начале заболевания беспокоило";
  return `${intro}: ${phrases.join(", ")}.`;
}
