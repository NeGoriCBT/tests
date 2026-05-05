/**
 * Структурированный «Анамнез жизни» для второй версии анкеты (Mental Help v2).
 */

export const LIFE_STRUCTURED_ID = "life-structured";

export const HEREDITY_NO_PHRASE = "Наследственность по психическим расстройствам не отягощена.";
export const HEREDITY_UNKNOWN_PHRASE = "Нет объективных данных о наследственности.";

/** @typedef {{ who: string; siblingDegree?: string; line?: string; pathology: string[]; pathologyOther?: string }} HeredityCase */

/** @typedef {{ specialist: string; customOther: string; reason: string; reasonUnknown: boolean }} ChildhoodVisit */

const CHILDHOOD_SPECIALIST_CODES = new Set(["neuro", "psych", "endo", "custom"]);

const WHO_OPTIONS = [
  ["mother", "Мама"],
  ["father", "Папа"],
  ["brother", "Брат"],
  ["sister", "Сестра"],
  ["grandfather", "Дедушка"],
  ["grandmother", "Бабушка"],
  ["aunt", "Тётя"],
  ["uncle", "Дядя"],
  ["nephew", "Племянник"],
  ["niece", "Племянница"],
];

const WHO_CODES = new Set(WHO_OPTIONS.map(([v]) => v));

/** Род в грамматике формулировки «наблюдался/наблюдалась» (по полу родственника). */
function isRelativeFeminine(who) {
  return (
    who === "mother" ||
    who === "sister" ||
    who === "grandmother" ||
    who === "aunt" ||
    who === "niece"
  );
}

const SIBLING_DEG_FEM = [
  ["rod_f", "родная"],
  ["dv_f", "двоюродная"],
  ["tr_f", "троюродная"],
  ["dal_f", "дальняя"],
];

const SIBLING_DEG_MASC = [
  ["rod_m", "родной"],
  ["dv_m", "двоюродный"],
  ["tr_m", "троюродный"],
  ["dal_m", "дальний"],
];

const ALL_SIBLING_DEGS = new Set([...SIBLING_DEG_FEM.map(([c]) => c), ...SIBLING_DEG_MASC.map(([c]) => c)]);

const LINE_DEGS_FEM = new Set(["dv_f", "tr_f", "dal_f"]);
const LINE_DEGS_MASC = new Set(["dv_m", "tr_m", "dal_m"]);

function needsSiblingDegree(who) {
  return who === "brother" || who === "sister" || who === "nephew" || who === "niece";
}

/** @param {string} who @param {string | undefined} siblingDegree */
function needsLine(who, siblingDegree) {
  if (who === "grandmother" || who === "grandfather" || who === "aunt" || who === "uncle") return true;
  if (!needsSiblingDegree(who) || !siblingDegree) return false;
  if ((who === "sister" || who === "niece") && LINE_DEGS_FEM.has(siblingDegree)) return true;
  if ((who === "brother" || who === "nephew") && LINE_DEGS_MASC.has(siblingDegree)) return true;
  return false;
}

function linePhraseForWord(line) {
  if (line === "maternal") return "по маминой линии";
  if (line === "paternal") return "по папиной линии";
  return "";
}

/** @param {string} who @param {string | undefined} deg @param {string | undefined} line */
function describeRelativeForWord(who, deg, line) {
  const lp = line && needsLine(who, deg) ? ` ${linePhraseForWord(line)}` : "";
  if (who === "mother") return "мама";
  if (who === "father") return "папа";
  if (who === "grandmother") return `бабушка${lp}`;
  if (who === "grandfather") return `дедушка${lp}`;
  if (who === "aunt") return `тётя${lp}`;
  if (who === "uncle") return `дядя${lp}`;
  if (who === "sister") {
    const adj = deg ? SIBLING_DEG_FEM.find(([c]) => c === deg)?.[1] : "";
    const core = adj ? `${adj} сестра` : "сестра";
    return needsLine(who, deg) ? `${core}${lp}` : core;
  }
  if (who === "brother") {
    const adj = deg ? SIBLING_DEG_MASC.find(([c]) => c === deg)?.[1] : "";
    const core = adj ? `${adj} брат` : "брат";
    return needsLine(who, deg) ? `${core}${lp}` : core;
  }
  if (who === "niece") {
    const adj = deg ? SIBLING_DEG_FEM.find(([c]) => c === deg)?.[1] : "";
    const core = adj ? `${adj} племянница` : "племянница";
    return needsLine(who, deg) ? `${core}${lp}` : core;
  }
  if (who === "nephew") {
    const adj = deg ? SIBLING_DEG_MASC.find(([c]) => c === deg)?.[1] : "";
    const core = adj ? `${adj} племянник` : "племянник";
    return needsLine(who, deg) ? `${core}${lp}` : core;
  }
  return "";
}

/** @param {HeredityCase} c */
function formatOneHeredityCaseForWord(c) {
  const rel = describeRelativeForWord(c.who, c.siblingDegree, c.line);
  const path = Array.isArray(c.pathology) ? c.pathology : [];
  const bits = path.map((code) => pathologyLabelForWord(code, c.who)).filter(Boolean);
  const o = String(c.pathologyOther ?? "").trim();
  if (o) bits.push(o);
  const p = bits.join(", ");
  if (!rel && !p) return "";
  if (!rel) return p;
  if (!p) return rel;
  return `${rel} ${p}`;
}

/** @param {HeredityCase[]} cases */
function formatHeredityCasesLineForWord(cases) {
  const parts = (cases || []).map(formatOneHeredityCaseForWord).filter(Boolean);
  return parts.join(", ");
}

/** @returns {Record<string, unknown>} */
export function emptyLifeStructuredState() {
  return {
    heredity: "",
    heredityCases: [],
    /** Если true при ответе «Да» — форма черновика скрыта, виден только список и «Добавить ещё». */
    heredityCloseDraft: false,
    birthFamily: "",
    birthOrder: "",
    birthChildrenTotal: "",
    birthTerm: "",
    birthDelivery: "",
    birthCourse: "",
    birthCourseDetails: "",
    birthTrauma: "",
    birthTraumaDetails: "",
    earlyNoIssues: false,
    earlySpeechLate: false,
    earlySpeechAge: "",
    earlySpeechAgeUnknown: false,
    earlyWalkLate: false,
    earlyWalkAge: "",
    earlyWalkAgeUnknown: false,
    earlyDontKnow: false,
    devFirstYear: "",
    devFirstYearDelayDetails: "",
    enuresisAfter5: "",
    parasomnia: "",
    parasomniaNightFears: false,
    parasomniaNightmares: false,
    parasomniaSleepwalk: false,
    parasomniaSleeptalk: false,
    parasomniaOther: "",
    kindergartenAttend: "",
    kindergartenAdapt: "",
    kindergartenAdaptDetails: "",
    /** @type {"" | "yes" | "no"} */
    childhoodSpecialists: "",
    /** @type {ChildhoodVisit[]} */
    childhoodVisits: [],
    kindergarten: "",
    schoolStartAge: "",
    schoolPerformance: "",
    schoolClasses: null,
    army: "",
    eduSecDone: false,
    eduSecUndone: false,
    eduSecSpec: "",
    eduHiDone: false,
    eduHiUndone: false,
    eduHiSpec: "",
  };
}

/**
 * @param {string | undefined} jsonStr
 * @returns {Record<string, unknown>}
 */
/** @param {unknown} raw @returns {HeredityCase | null} */
function normalizeHeredityCase(raw) {
  if (!raw || typeof raw !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const who = typeof o.who === "string" ? o.who : "";
  if (!WHO_CODES.has(who)) return null;
  const pathology = Array.isArray(o.pathology) ? o.pathology.filter((x) => typeof x === "string") : [];
  /** @type {HeredityCase} */
  const c = { who, pathology, pathologyOther: typeof o.pathologyOther === "string" ? o.pathologyOther : "" };
  const sd = typeof o.siblingDegree === "string" ? o.siblingDegree : "";
  if (needsSiblingDegree(who)) {
    if (!ALL_SIBLING_DEGS.has(sd)) return null;
    c.siblingDegree = sd;
  }
  const ln = o.line === "maternal" || o.line === "paternal" ? o.line : "";
  if (needsLine(who, c.siblingDegree) && ln) c.line = ln;
  return c;
}

function migrateLegacyHeredity(base, raw) {
  if (base.heredity !== "yes") return;
  const cases = Array.isArray(raw.heredityCases) ? raw.heredityCases : [];
  if (cases.length) return;
  const person = typeof raw.kinshipPerson === "string" ? raw.kinshipPerson : "";
  const line = raw.kinshipLine === "maternal" || raw.kinshipLine === "paternal" ? raw.kinshipLine : undefined;
  const pathology = Array.isArray(raw.pathology) ? raw.pathology.filter((x) => typeof x === "string") : [];
  const pathologyOther = typeof raw.pathologyOther === "string" ? raw.pathologyOther : "";
  const mappedPath = [];
  for (const code of pathology) {
    if (code === "dep_addiction") {
      mappedPath.push("dep_alcohol", "dep_narcotic");
    } else mappedPath.push(code);
  }
  /** @type {HeredityCase | null} */
  let c = null;
  const direct = ["mother", "father", "brother", "sister", "grandmother", "grandfather", "aunt", "uncle"].includes(person);
  if (direct && person) {
    c = { who: person, pathology: mappedPath, pathologyOther };
    if (person === "brother") c.siblingDegree = "rod_m";
    if (person === "sister") c.siblingDegree = "rod_f";
    if (line && needsLine(person, c.siblingDegree)) c.line = line;
  } else if (person === "sibling_full") {
    c = { who: "sister", siblingDegree: "rod_f", pathology: mappedPath, pathologyOther };
  } else if (person === "cousin2") {
    c = { who: "sister", siblingDegree: "dv_f", pathology: mappedPath, pathologyOther };
    if (line) c.line = line;
  } else if (person === "cousin3") {
    c = { who: "sister", siblingDegree: "tr_f", pathology: mappedPath, pathologyOther };
    if (line) c.line = line;
  } else if (person === "cousin_far") {
    c = { who: "sister", siblingDegree: "dal_f", pathology: mappedPath, pathologyOther };
    if (line) c.line = line;
  }
  if (c) base.heredityCases = [c];
}

/** @param {unknown} raw @returns {ChildhoodVisit | null} */
function normalizeChildhoodVisit(raw) {
  if (!raw || typeof raw !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const sp = typeof o.specialist === "string" && CHILDHOOD_SPECIALIST_CODES.has(o.specialist) ? o.specialist : "neuro";
  return {
    specialist: sp,
    customOther: typeof o.customOther === "string" ? o.customOther : "",
    reason: typeof o.reason === "string" ? o.reason : "",
    reasonUnknown: o.reasonUnknown === true,
  };
}

/** @param {unknown} arr @returns {ChildhoodVisit[]} */
function normalizeChildhoodVisits(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeChildhoodVisit).filter(Boolean);
}

/**
 * Старый формат: чекбоксы по специалистам и «Не наблюдался».
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} raw
 */
function migrateLegacyChildhood(base, raw) {
  const hasNew =
    raw.childhoodSpecialists === "yes" ||
    raw.childhoodSpecialists === "no" ||
    Object.prototype.hasOwnProperty.call(raw, "childhoodVisits");
  if (hasNew) return;
  const none = raw.childhoodNone === true;
  const neuro = raw.childhoodNeuro === true;
  const psych = raw.childhoodPsych === true;
  const endo = raw.childhoodEndo === true;
  const any = neuro || psych || endo;
  if (none && !any) {
    base.childhoodSpecialists = "no";
    base.childhoodVisits = [];
    return;
  }
  if (any) {
    base.childhoodSpecialists = "yes";
    /** @type {ChildhoodVisit[]} */
    const v = [];
    if (neuro) v.push({ specialist: "neuro", customOther: "", reason: "", reasonUnknown: false });
    if (psych) v.push({ specialist: "psych", customOther: "", reason: "", reasonUnknown: false });
    if (endo) v.push({ specialist: "endo", customOther: "", reason: "", reasonUnknown: false });
    base.childhoodVisits = v;
  }
}

export function parseLifeStructuredString(jsonStr) {
  const base = emptyLifeStructuredState();
  let raw = {};
  try {
    const p = JSON.parse(jsonStr || "{}");
    if (p && typeof p === "object") raw = p;
  } catch {
    raw = {};
  }
  for (const k of Object.keys(base)) {
    if (k === "heredityCases") {
      if (Array.isArray(raw.heredityCases)) {
        base.heredityCases = raw.heredityCases.map(normalizeHeredityCase).filter(Boolean);
      }
    } else if (k === "heredityCloseDraft") {
      base.heredityCloseDraft = raw.heredityCloseDraft === true;
    } else if (k === "earlySpeechAgeUnknown" || k === "earlyWalkAgeUnknown" || k === "earlyDontKnow") {
      base[k] = raw[k] === true;
    } else if (k === "childhoodVisits") {
      if (Object.prototype.hasOwnProperty.call(raw, "childhoodVisits")) {
        base.childhoodVisits = normalizeChildhoodVisits(raw.childhoodVisits);
      }
    } else if (k === "childhoodSpecialists") {
      const v = raw.childhoodSpecialists;
      base.childhoodSpecialists = v === "yes" || v === "no" ? v : "";
    } else if (k in raw) {
      base[k] = raw[k];
    }
  }
  migrateLegacyHeredity(base, raw);
  migrateLegacyChildhood(base, raw);
  return base;
}

function pathologyLabel(code) {
  const m = {
    dep_alcohol: "алкогольная зависимость",
    dep_narcotic: "наркотическая зависимость",
    dep_depression: "депрессивные расстройства",
    dep_anxiety: "тревожные расстройства",
    dep_suicide_done: "суицид (реализованный)",
    dep_suicide_attempt: "суицидальные попытки",
    dep_psychiatrist: "наблюдался(ась) у психиатра",
    dep_dementia: "деменция",
    dep_addiction: "алкогольная зависимость, наркотическая зависимость",
  };
  return m[code] ?? code;
}

/** @param {string} who — код родственника из WHO_OPTIONS */
function psychWordPhraseForWord(who) {
  if (!who) return "наблюдался(ась) у психиатра";
  return isRelativeFeminine(who) ? "наблюдалась у психиатра" : "наблюдался у психиатра";
}

/** Подпись пункта в форме (с заглавной буквы). */
function psychiatristOptionUiLabel(who) {
  if (!who) return "Наблюдение у психиатра";
  return isRelativeFeminine(who) ? "Наблюдалась у психиатра" : "Наблюдался у психиатра";
}

/** @param {string} code @param {string} [who] */
function pathologyLabelForWord(code, who) {
  if (code === "dep_psychiatrist") return psychWordPhraseForWord(who);
  return pathologyLabel(code);
}

function schoolPerfLabel(v) {
  const m = {
    udarnik: "ударник",
    otlichnik: "отличник",
    horoshist: "хорошист",
    troechnik: "троечник",
  };
  return m[v] ?? v;
}

/** Глагол для блока «Рождение и семья» по полу пациента. @param {"male" | "female" | null} gender */
function verbBornPastForBirthBlock(gender) {
  if (gender === "male") return "Родился";
  if (gender === "female") return "Родилась";
  return "Родился(лась)";
}

/** @param {"male" | "female" | null} gender */
function verbTransferredPast(gender) {
  if (gender === "male") return "Перенес";
  if (gender === "female") return "Перенесла";
  return "Перенес(ла)";
}

function childOrderInstrumentalWord(n) {
  const m = {
    1: "первым",
    2: "вторым",
    3: "третьим",
    4: "четвертым",
    5: "пятым",
    6: "шестым",
    7: "седьмым",
    8: "восьмым",
    9: "девятым",
    10: "десятым",
  };
  return m[n] ?? `${n}-м`;
}

function upperFirst(s) {
  const t = String(s ?? "").trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** @param {Record<string, unknown>} state */
function birthOrderPhraseForWord(state) {
  const order = Number(state.birthOrder);
  const total = Number(state.birthChildrenTotal);
  if (!Number.isInteger(order) || !Number.isInteger(total) || order < 1 || total < 1 || order > 10 || total > 10 || order > total) {
    return "";
  }
  if (order === 1 && total === 1) return "единственным ребенком";
  if (order === total && total > 1) return "младшим ребенком";
  return `${childOrderInstrumentalWord(order)} ребенком`;
}

/** @param {Record<string, unknown>} state @param {"male" | "female" | null} gender */
function birth345LineForWord(state) {
  const bits = [];
  if (state.birthTerm === "term") bits.push("Роды в срок");
  if (state.birthTerm === "preterm") bits.push("Роды преждевременные");
  if (state.birthTerm === "postterm") bits.push("Роды запоздалые");
  if (state.birthTerm === "unknown") bits.push("срок родов не известен");

  if (state.birthDelivery === "self") bits.push("самостоятельные");
  if (state.birthDelivery === "cesarean") bits.push("путем кесарева сечения");

  if (state.birthCourse === "normal") bits.push("без осложнений");
  if (state.birthCourse === "complicated") {
    const d = String(state.birthCourseDetails ?? "").trim();
    bits.push(d ? `протекали с осложнениями (со слов: "${d}")` : "протекали с осложнениями");
  }
  if (state.birthCourse === "unknown") bits.push("характер родов не известен");

  if (!bits.length) return "";
  bits[0] = upperFirst(bits[0]);
  return `${bits.join(", ")}.`;
}

/** @param {Record<string, unknown>} state @param {"male" | "female" | null} gender */
function parasomniaListForWord(state) {
  const items = [];
  if (state.parasomniaNightFears) items.push("ночные страхи");
  if (state.parasomniaNightmares) items.push("кошмары");
  if (state.parasomniaSleepwalk) items.push("снохождения");
  if (state.parasomniaSleeptalk) items.push("сноговорения");
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} и ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} и ${items[items.length - 1]}`;
}

/** @param {Record<string, unknown>} state */
function block3WordLines(state) {
  const lines = [];

  if (state.devFirstYear === "timely") lines.push("Психомоторное развитие в первый год жизни своевременное.");
  if (state.devFirstYear === "delay") {
    const d = String(state.devFirstYearDelayDetails ?? "").trim();
    lines.push(
      d
        ? `В первый год жизни отмечалась задержка психомоторного развития (со слов: "${d}").`
        : "В первый год жизни отмечалась задержка психомоторного развития."
    );
  }
  if (state.devFirstYear === "unknown") lines.push("Данные о психомоторном развитии в первый год жизни отсутствуют.");

  const enNo = state.enuresisAfter5 === "no";
  const parNo = state.parasomnia === "no";
  if (enNo && parNo) {
    lines.push("Энуреза после 5 лет, ночных страхов, кошмаров, снохождений и сноговорений в детстве не было.");
  } else {
    if (state.enuresisAfter5 === "yes") lines.push("В детстве отмечался энурез после 5 лет.");
    if (state.enuresisAfter5 === "no") lines.push("Энуреза после 5 лет не было.");
    if (state.enuresisAfter5 === "unknown") lines.push("Сведения об энурезе отсутствуют.");

    if (state.parasomnia === "no") {
      lines.push("Ночных страхов, кошмаров, снохождений и сноговорений в детстве не было.");
    } else if (state.parasomnia === "yes") {
      const base = parasomniaListForWord(state);
      const other = String(state.parasomniaOther ?? "").trim();
      if (base || other) {
        const list = base || "парасомнии";
        lines.push(other ? `В детстве отмечались ${list} (со слов: "${other}").` : `В детстве отмечались ${list}.`);
      }
    } else if (state.parasomnia === "unknown") {
      lines.push("Сведения о парасомниях в детстве отсутствуют.");
    }
  }

  if (state.kindergartenAttend === "yes") {
    if (state.kindergartenAdapt === "easy") {
      lines.push("Детский сад посещал, адаптировался без особенностей.");
    } else if (state.kindergartenAdapt === "difficult") {
      const d = String(state.kindergartenAdaptDetails ?? "").trim();
      lines.push(
        d
          ? `Детский сад посещал, отмечались трудности адаптации (со слов: "${d}").`
          : "Детский сад посещал, отмечались трудности адаптации."
      );
    } else if (state.kindergartenAdapt === "unknown") {
      lines.push("Детский сад посещал, сведения об адаптации отсутствуют.");
    } else {
      lines.push("Детский сад посещал.");
    }
  } else if (state.kindergartenAttend === "no") {
    lines.push("Детский сад не посещал, воспитывался дома.");
  } else if (state.kindergartenAttend === "unknown") {
    lines.push("Данные о посещении детского сада отсутствуют.");
  }

  return lines;
}

/** @param {"male" | "female" | null} gender */
function childhoodObservedVerbPast(gender) {
  if (gender === "male") return "наблюдался";
  if (gender === "female") return "наблюдалась";
  return "наблюдался(ась)";
}

/** @param {"male" | "female" | null} gender */
function childhoodNegativeVerbPast(gender) {
  if (gender === "male") return "не наблюдался";
  if (gender === "female") return "не наблюдалась";
  return "не наблюдался(ась)";
}

/** @param {ChildhoodVisit} v */
function childhoodVisitSpecialistPhraseForWord(v) {
  const co = String(v.customOther ?? "").trim();
  if (v.specialist === "custom") {
    if (co) return `врача ${co}`;
    return "врача (специализация не указана)";
  }
  if (v.specialist === "neuro") return "врача невролога";
  if (v.specialist === "psych") return "врача психиатра";
  if (v.specialist === "endo") return "врача эндокринолога";
  return "врача невролога";
}

/** @param {ChildhoodVisit} v */
function childhoodVisitClauseForWord(v) {
  if (v.specialist === "custom" && !String(v.customOther ?? "").trim() && !v.reasonUnknown && !String(v.reason ?? "").trim()) {
    return "";
  }
  const head = `у ${childhoodVisitSpecialistPhraseForWord(v)}`;
  if (v.reasonUnknown === true) return `${head}, причину не знает`;
  const r = String(v.reason ?? "").trim();
  if (r) return `${head} по причине ${r}`;
  return head;
}

/**
 * @param {Record<string, unknown>} state
 * @param {"male" | "female" | null} gender
 */
function formatChildhoodSpecialistsLineForWord(state, gender) {
  const y = state.childhoodSpecialists;
  if (y === "no") return `В детстве у специалистов ${childhoodNegativeVerbPast(gender)}.`;
  if (y !== "yes") return "";
  const list = Array.isArray(state.childhoodVisits) ? /** @type {ChildhoodVisit[]} */ (state.childhoodVisits) : [];
  const clauses = list.map(childhoodVisitClauseForWord).filter(Boolean);
  if (!clauses.length) return "";
  return `В детстве ${childhoodObservedVerbPast(gender)} ${clauses.join(", ")}.`;
}

/**
 * @param {Record<string, unknown>} state
 * @param {"male" | "female" | null} gender
 */
export function formatLifeStructuredForWord(state, gender) {
  const lines = [];
  const h = state.heredity;
  if (h === "no") lines.push(HEREDITY_NO_PHRASE);
  else if (h === "unknown") lines.push(HEREDITY_UNKNOWN_PHRASE);
  else if (h === "yes") {
    const cases = Array.isArray(state.heredityCases) ? /** @type {HeredityCase[]} */ (state.heredityCases) : [];
    const line = formatHeredityCasesLineForWord(cases);
    if (line) lines.push(`Наследственность: ${line}.`);
    else lines.push("В семье отмечались психические расстройства (родственники и характер патологии не указаны).");
  }

  const born = verbBornPastForBirthBlock(gender);
  const birthFamilyPart =
    state.birthFamily === "full"
      ? `${born} в полной семье`
      : state.birthFamily === "incomplete"
        ? `${born} в неполной семье`
        : "";
  const birthOrderPart = birthOrderPhraseForWord(state);
  if (birthFamilyPart && birthOrderPart) lines.push(`${birthFamilyPart}, ${birthOrderPart}.`);
  else if (birthFamilyPart) lines.push(`${birthFamilyPart}.`);
  else if (birthOrderPart) lines.push(`${upperFirst(birthOrderPart)}.`);

  const birth345Line = birth345LineForWord(state);
  if (birth345Line) lines.push(birth345Line);

  if (state.birthTrauma === "no") lines.push("Родовой травмы не было.");
  if (state.birthTrauma === "yes") {
    const details = String(state.birthTraumaDetails ?? "").trim();
    // Фраза фиксированная: «травма» женского рода, согласуем по слову «травма»
    lines.push(details ? `Была родовая травма (со слов: "${details}").` : `Была родовая травма.`);
  }
  if (state.birthTrauma === "unknown") lines.push("Объективных данных о наличии родовой травмы нет.");

  lines.push(...block3WordLines(state));

  const chLine = formatChildhoodSpecialistsLineForWord(state, gender);
  if (chLine) lines.push(chLine);

  const sa = String(state.schoolStartAge ?? "").trim();
  const perf = schoolPerfLabel(String(state.schoolPerformance ?? ""));
  const cl = state.schoolClasses;
  const schoolBits = [];
  if (sa) schoolBits.push(`в школу пошёл(ла) с ${sa} лет`);
  if (state.schoolPerformance) schoolBits.push(`учился(лась) как ${perf}`);
  if (cl != null && cl >= 1 && cl <= 11) schoolBits.push(`окончил(а) ${cl} классов`);
  if (schoolBits.length) lines.push(`Школа: ${schoolBits.join("; ")}.`);

  if (gender === "male") {
    if (state.army === "served") lines.push("Армия: служил.");
    if (state.army === "not") lines.push("Армия: не служил.");
  }

  const edu = [];
  if (state.eduSecDone) edu.push(`среднее образование — законченное${state.eduSecSpec ? ` (${String(state.eduSecSpec).trim()})` : ""}`);
  if (state.eduSecUndone) edu.push(`среднее образование — незаконченное${state.eduSecSpec ? ` (${String(state.eduSecSpec).trim()})` : ""}`);
  if (state.eduHiDone) edu.push(`высшее образование — законченное${state.eduHiSpec ? ` (${String(state.eduHiSpec).trim()})` : ""}`);
  if (state.eduHiUndone) edu.push(`высшее образование — незаконченное${state.eduHiSpec ? ` (${String(state.eduHiSpec).trim()})` : ""}`);
  if (edu.length) lines.push(`Образование: ${edu.join("; ")}.`);

  return lines.join("\n").trim();
}

const PATHOLOGY_OPTIONS = [
  ["dep_alcohol", "Алкогольная зависимость"],
  ["dep_narcotic", "Наркотическая зависимость"],
  ["dep_depression", "Депрессивные расстройства"],
  ["dep_anxiety", "Тревожные расстройства"],
  ["dep_suicide_done", "Суицид (реализованный)"],
  ["dep_suicide_attempt", "Суицидальные попытки"],
  ["dep_psychiatrist", "Наблюдение у психиатра"],
  ["dep_dementia", "Деменция"],
];

/** @param {HTMLElement} root */
function readHeredityDraftFromDom(root) {
  const whoSel = root.querySelector("#mh-life-who");
  const who = whoSel instanceof HTMLSelectElement ? whoSel.value.trim() : "";
  const sibSel = root.querySelector("#mh-life-sibling-deg");
  const siblingDegree = sibSel instanceof HTMLSelectElement && sibSel.value ? sibSel.value : undefined;
  const lineEl = root.querySelector('input[name="mh-life-draft-line"]:checked');
  const line = lineEl instanceof HTMLInputElement && lineEl.value ? lineEl.value : undefined;
  const pathology = [];
  root.querySelectorAll("input[data-h-path-draft]").forEach((el) => {
    if (el instanceof HTMLInputElement && el.checked && el.dataset.hPathDraft) pathology.push(el.dataset.hPathDraft);
  });
  const otherInp = root.querySelector("#mh-life-draft-pathology-other");
  const pathologyOther = otherInp instanceof HTMLInputElement ? otherInp.value : "";
  /** @type {HeredityCase} */
  const c = { who, pathology, pathologyOther };
  if (siblingDegree) c.siblingDegree = siblingDegree;
  if (line === "maternal" || line === "paternal") c.line = line;
  return c;
}

/** @param {HeredityCase} draft */
function validateHeredityDraft(draft) {
  if (!draft.who || !WHO_CODES.has(draft.who)) return "Выберите родственника.";
  if (needsSiblingDegree(draft.who)) {
    if (!draft.siblingDegree || !ALL_SIBLING_DEGS.has(draft.siblingDegree)) return "Укажите степень родства (родной / двоюродный и т.д.).";
  }
  if (needsLine(draft.who, draft.siblingDegree)) {
    if (draft.line !== "maternal" && draft.line !== "paternal") return "Укажите линию (по маминой или по папиной).";
  }
  const o = String(draft.pathologyOther ?? "").trim();
  if (!draft.pathology.length && !o) return "Отметьте характер патологии или укажите своё.";
  return "";
}

/** @param {HeredityCase} c */
function summarizeCaseForUi(c) {
  return formatOneHeredityCaseForWord(c) || JSON.stringify(c);
}

/**
 * @param {HTMLElement} contentEl
 * @param {Record<string, string>} answers
 * @param {number} qIndex
 * @param {number} stepsLen
 * @param {"male" | "female" | null} gender
 * @param {HTMLButtonElement | null} nextWizardBtn
 */
export function renderLifeStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn) {
  const step = { blockLead: { title: "3 блок. Анамнез жизни", intro: "Заполните поля ниже." }, codeLabel: "Анамнез жизни", prompt: "" };
  const state = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);

  contentEl.replaceChildren();

  const progressEl = contentEl.closest(".mh-step")?.querySelector(".mh-progress");
  if (progressEl) progressEl.textContent = `Шаг опросника: ${qIndex + 1} из ${stepsLen}`;

  if (step.blockLead) {
    const h2 = document.createElement("h2");
    h2.className = "mh-block-title";
    h2.textContent = step.blockLead.title;
    contentEl.appendChild(h2);
    const intro = document.createElement("p");
    intro.className = "mh-prompt";
    intro.textContent = step.blockLead.intro;
    contentEl.appendChild(intro);
  }
  const h3 = document.createElement("h3");
  h3.className = "mh-question-title";
  h3.textContent = "Были ли у Ваших родственников установленные расстройства психики?";
  contentEl.appendChild(h3);

  function fieldset(title) {
    const fs = document.createElement("fieldset");
    fs.className = "mh-life-fieldset";
    const leg = document.createElement("legend");
    leg.className = "mh-life-legend";
    leg.textContent = title;
    fs.appendChild(leg);
    return fs;
  }

  function radioRow(name, value, label, checked) {
    const lab = document.createElement("label");
    lab.className = "mh-life-radio";
    const inp = document.createElement("input");
    inp.type = "radio";
    inp.name = name;
    inp.value = value;
    inp.checked = checked;
    lab.appendChild(inp);
    lab.appendChild(document.createTextNode(` ${label}`));
    return lab;
  }

  const fs0 = fieldset("Ответ");
  fs0.appendChild(radioRow("mh-life-heredity", "yes", "Да", state.heredity === "yes"));
  fs0.appendChild(radioRow("mh-life-heredity", "no", "Нет", state.heredity === "no"));
  fs0.appendChild(radioRow("mh-life-heredity", "unknown", "Не знаю", state.heredity === "unknown"));
  contentEl.appendChild(fs0);

  const cases = Array.isArray(state.heredityCases) ? /** @type {HeredityCase[]} */ (state.heredityCases) : [];
  const draftClosed = state.heredity === "yes" && state.heredityCloseDraft === true;

  const listPanel = document.createElement("div");
  listPanel.className = "mh-life-heredity-list-panel";
  listPanel.hidden = state.heredity !== "yes";

  const fsList = fieldset("Уже добавлено в отягощённость");
  const listIntro = document.createElement("p");
  listIntro.className = "mh-life-hint";
  if (draftClosed) {
    listIntro.textContent =
      cases.length > 0
        ? "Перечисление завершено. Нажмите «Добавить ещё», если нужно указать ещё одного родственника."
        : "Перечисление завершено. Нажмите «Добавить ещё», чтобы указать родственника, или оставьте список пустым.";
  } else if (cases.length) {
    listIntro.textContent =
      "Список не сбрасывается при добавлении нового случая. Ниже заполните форму для следующего родственника.";
  } else {
    listIntro.textContent = "Пока никого не добавили — заполните форму под этим списком и нажмите «Добавить ещё».";
  }
  fsList.appendChild(listIntro);
  const ul = document.createElement("ul");
  ul.className = "mh-life-heredity-list";
  cases.forEach((c, idx) => {
    const li = document.createElement("li");
    li.className = "mh-life-heredity-item";
    const span = document.createElement("span");
    span.textContent = summarizeCaseForUi(c);
    li.appendChild(span);
    const del = document.createElement("button");
    del.type = "button";
    del.className = "mh-life-heredity-remove";
    del.textContent = "Удалить";
    del.addEventListener("click", () => {
      readLifeStructuredFromDom(contentEl, answers);
      const st = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
      const arr = Array.isArray(st.heredityCases) ? /** @type {HeredityCase[]} */ (st.heredityCases) : [];
      arr.splice(idx, 1);
      st.heredityCases = arr;
      answers[LIFE_STRUCTURED_ID] = JSON.stringify(st);
      renderLifeStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
    });
    li.appendChild(del);
    ul.appendChild(li);
  });
  fsList.appendChild(ul);
  listPanel.appendChild(fsList);

  const casesJson = document.createElement("textarea");
  casesJson.id = "mh-life-heredity-cases-json";
  casesJson.hidden = true;
  casesJson.setAttribute("aria-hidden", "true");
  casesJson.textContent = JSON.stringify(cases);
  listPanel.appendChild(casesJson);

  const listActions = document.createElement("div");
  listActions.className = "mh-life-heredity-list-actions";
  const btnReopenDraft = document.createElement("button");
  btnReopenDraft.type = "button";
  btnReopenDraft.className = "mh-life-add-case";
  btnReopenDraft.textContent = "Добавить ещё";
  btnReopenDraft.hidden = !draftClosed;
  listActions.appendChild(btnReopenDraft);
  listPanel.appendChild(listActions);

  contentEl.appendChild(listPanel);

  const yesBlock = document.createElement("div");
  yesBlock.id = "mh-life-yes-block";
  yesBlock.className = "mh-life-yes-block";
  yesBlock.hidden = state.heredity !== "yes" || draftClosed;

  const draftWrap = document.createElement("div");
  draftWrap.className = "mh-life-heredity-draft-wrap";
  const draftTitle = document.createElement("p");
  draftTitle.className = "mh-life-heredity-draft-title";
  draftTitle.textContent = "Следующий случай (форма обнуляется после «Добавить ещё»)";
  draftWrap.appendChild(draftTitle);

  const fsWho = fieldset("1.1. Кто именно");
  const whoSel = document.createElement("select");
  whoSel.id = "mh-life-who";
  whoSel.className = "mh-life-select";
  const w0 = document.createElement("option");
  w0.value = "";
  w0.textContent = "— выберите —";
  whoSel.appendChild(w0);
  WHO_OPTIONS.forEach(([v, lab]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = lab;
    whoSel.appendChild(o);
  });
  fsWho.appendChild(whoSel);
  draftWrap.appendChild(fsWho);

  const fsSib = fieldset("1.2. Степень родства");
  const sibRow = document.createElement("div");
  sibRow.id = "mh-life-sibling-row";
  sibRow.className = "mh-life-row";
  const sibSel = document.createElement("select");
  sibSel.id = "mh-life-sibling-deg";
  sibSel.className = "mh-life-select";
  sibSel.disabled = true;
  const sx = document.createElement("option");
  sx.value = "";
  sx.textContent = "—";
  sibSel.appendChild(sx);
  sibRow.appendChild(sibSel);
  fsSib.appendChild(sibRow);
  fsSib.hidden = true;
  draftWrap.appendChild(fsSib);

  const fsLine = fieldset("1.3. Линия");
  const lineRow = document.createElement("div");
  lineRow.id = "mh-life-draft-line-row";
  lineRow.className = "mh-life-line-row";
  lineRow.appendChild(document.createTextNode("Линия: "));
  lineRow.appendChild(radioRow("mh-life-draft-line", "maternal", "По маминой линии", false));
  lineRow.appendChild(radioRow("mh-life-draft-line", "paternal", "По папиной линии", false));
  fsLine.appendChild(lineRow);
  fsLine.hidden = true;
  draftWrap.appendChild(fsLine);

  const fsPath = fieldset("1.4. Характер патологии (можно несколько)");
  PATHOLOGY_OPTIONS.forEach(([code, lab]) => {
    const labEl = document.createElement("label");
    labEl.className = "mh-life-check";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.dataset.hPathDraft = code;
    labEl.appendChild(cb);
    if (code === "dep_psychiatrist") {
      const span = document.createElement("span");
      span.id = "mh-life-psychiatrist-option-text";
      span.textContent = ` ${psychiatristOptionUiLabel("")}`;
      labEl.appendChild(span);
    } else {
      labEl.appendChild(document.createTextNode(` ${lab}`));
    }
    fsPath.appendChild(labEl);
  });
  const otherL = document.createElement("label");
  otherL.className = "mh-life-custom-wrap";
  otherL.textContent = "Своё (другие расстройства): ";
  const otherInp = document.createElement("input");
  otherInp.type = "text";
  otherInp.id = "mh-life-draft-pathology-other";
  otherInp.className = "mh-life-text";
  otherL.appendChild(otherInp);
  fsPath.appendChild(otherL);
  draftWrap.appendChild(fsPath);

  const addRow = document.createElement("div");
  addRow.className = "mh-life-heredity-actions";
  const btnAdd = document.createElement("button");
  btnAdd.type = "button";
  btnAdd.className = "mh-life-add-case";
  btnAdd.textContent = "Добавить ещё";
  const btnFinish = document.createElement("button");
  btnFinish.type = "button";
  btnFinish.className = "mh-life-heredity-icon-btn mh-life-heredity-icon-btn--ok";
  btnFinish.textContent = "✓";
  btnFinish.setAttribute("aria-label", "Сохранить текущий случай в список и завершить перечисление");
  btnFinish.title = "Сохранить текущий выбор в список и завершить перечисление";
  const btnClearDraft = document.createElement("button");
  btnClearDraft.type = "button";
  btnClearDraft.className = "mh-life-heredity-icon-btn mh-life-heredity-icon-btn--clear";
  btnClearDraft.textContent = "✗";
  btnClearDraft.setAttribute("aria-label", "Очистить форму");
  btnClearDraft.title = "Очистить форму";
  addRow.appendChild(btnAdd);
  addRow.appendChild(btnFinish);
  addRow.appendChild(btnClearDraft);
  draftWrap.appendChild(addRow);

  yesBlock.appendChild(draftWrap);

  contentEl.appendChild(yesBlock);

  function setHeredityCloseDraft(flag) {
    readLifeStructuredFromDom(contentEl, answers);
    const st = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
    st.heredityCloseDraft = flag;
    answers[LIFE_STRUCTURED_ID] = JSON.stringify(st);
    renderLifeStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
  }

  function resetHeredityDraftForm() {
    if (whoSel instanceof HTMLSelectElement) whoSel.value = "";
    syncHeredityDraftUi();
    yesBlock.querySelectorAll("input[data-h-path-draft]").forEach((el) => {
      if (el instanceof HTMLInputElement) el.checked = false;
    });
    yesBlock.querySelectorAll('input[name="mh-life-draft-line"]').forEach((el) => {
      if (el instanceof HTMLInputElement) el.checked = false;
    });
    const oi = yesBlock.querySelector("#mh-life-draft-pathology-other");
    if (oi instanceof HTMLInputElement) oi.value = "";
  }

  btnClearDraft.addEventListener("click", () => resetHeredityDraftForm());
  btnReopenDraft.addEventListener("click", () => setHeredityCloseDraft(false));

  const fsB2 = fieldset("Блок 2. Рождение и семья");
  const q2a = document.createElement("p");
  q2a.className = "mh-life-edu-title";
  q2a.textContent = "Вы родились в полной семье?";
  fsB2.appendChild(q2a);
  fsB2.appendChild(radioRow("mh-life-birth", "full", "Да", state.birthFamily === "full"));
  fsB2.appendChild(radioRow("mh-life-birth", "incomplete", "Нет", state.birthFamily === "incomplete"));

  const q2b = document.createElement("p");
  q2b.className = "mh-life-edu-title";
  q2b.textContent = "Каким по счету ребенком вы родились?";
  fsB2.appendChild(q2b);
  const ordRow = document.createElement("div");
  ordRow.className = "mh-life-row";
  const ordSel = document.createElement("select");
  ordSel.id = "mh-life-birth-order";
  ordSel.className = "mh-life-select";
  const ordEmpty = document.createElement("option");
  ordEmpty.value = "";
  ordEmpty.textContent = "—";
  ordSel.appendChild(ordEmpty);
  for (let n = 1; n <= 10; n += 1) {
    const o = document.createElement("option");
    o.value = String(n);
    o.textContent = String(n);
    if (String(state.birthOrder ?? "") === String(n)) o.selected = true;
    ordSel.appendChild(o);
  }
  ordRow.appendChild(document.createTextNode("По счету: "));
  ordRow.appendChild(ordSel);
  fsB2.appendChild(ordRow);

  const totalRow = document.createElement("div");
  totalRow.className = "mh-life-row";
  const totalSel = document.createElement("select");
  totalSel.id = "mh-life-birth-total";
  totalSel.className = "mh-life-select";
  const totalEmpty = document.createElement("option");
  totalEmpty.value = "";
  totalEmpty.textContent = "—";
  totalSel.appendChild(totalEmpty);
  for (let n = 1; n <= 10; n += 1) {
    const o = document.createElement("option");
    o.value = String(n);
    o.textContent = String(n);
    if (String(state.birthChildrenTotal ?? "") === String(n)) o.selected = true;
    totalSel.appendChild(o);
  }
  totalRow.appendChild(document.createTextNode("Из скольких детей: "));
  totalRow.appendChild(totalSel);
  fsB2.appendChild(totalRow);

  const q3 = document.createElement("p");
  q3.className = "mh-life-edu-title";
  q3.textContent = "3 вопрос. Срок родов:";
  fsB2.appendChild(q3);
  fsB2.appendChild(radioRow("mh-life-birth-term", "term", "в срок (37-42 недели)", state.birthTerm === "term"));
  fsB2.appendChild(
    radioRow("mh-life-birth-term", "preterm", "раньше положенного срока (до 37 недель)", state.birthTerm === "preterm")
  );
  fsB2.appendChild(
    radioRow("mh-life-birth-term", "postterm", "позже положенного срока (после 42 недель)", state.birthTerm === "postterm")
  );
  fsB2.appendChild(radioRow("mh-life-birth-term", "unknown", "не знаю", state.birthTerm === "unknown"));

  const q4 = document.createElement("p");
  q4.className = "mh-life-edu-title";
  q4.textContent = "4 вопрос. Роды были?";
  fsB2.appendChild(q4);
  fsB2.appendChild(radioRow("mh-life-birth-delivery", "self", "Самостоятельные", state.birthDelivery === "self"));
  fsB2.appendChild(radioRow("mh-life-birth-delivery", "cesarean", "Кесарево сечение", state.birthDelivery === "cesarean"));

  const q5 = document.createElement("p");
  q5.className = "mh-life-edu-title";
  q5.textContent = "5 вопрос. Течение родов:";
  fsB2.appendChild(q5);
  fsB2.appendChild(radioRow("mh-life-birth-course", "normal", "Без осложнений", state.birthCourse === "normal"));
  fsB2.appendChild(radioRow("mh-life-birth-course", "complicated", "С осложнениями", state.birthCourse === "complicated"));
  fsB2.appendChild(radioRow("mh-life-birth-course", "unknown", "Не знаю", state.birthCourse === "unknown"));
  const courseDetailsRow = document.createElement("div");
  courseDetailsRow.className = "mh-life-row";
  courseDetailsRow.hidden = state.birthCourse !== "complicated";
  courseDetailsRow.appendChild(document.createTextNode("Уточнение осложнений: "));
  const courseDetailsInp = document.createElement("input");
  courseDetailsInp.type = "text";
  courseDetailsInp.id = "mh-life-birth-course-details";
  courseDetailsInp.className = "mh-life-text";
  courseDetailsInp.value = String(state.birthCourseDetails ?? "");
  courseDetailsRow.appendChild(courseDetailsInp);
  fsB2.appendChild(courseDetailsRow);
  fsB2.querySelectorAll('input[name="mh-life-birth-course"]').forEach((el) => {
    el.addEventListener("change", () => {
      const cr = fsB2.querySelector('input[name="mh-life-birth-course"]:checked');
      const isComp = cr instanceof HTMLInputElement && cr.value === "complicated";
      courseDetailsRow.hidden = !isComp;
      if (!isComp) courseDetailsInp.value = "";
    });
  });

  const q6 = document.createElement("p");
  q6.className = "mh-life-edu-title";
  q6.textContent = "Была ли родовая травма?";
  fsB2.appendChild(q6);
  fsB2.appendChild(radioRow("mh-life-birth-trauma", "yes", "Да", state.birthTrauma === "yes"));
  fsB2.appendChild(radioRow("mh-life-birth-trauma", "no", "Нет", state.birthTrauma === "no"));
  fsB2.appendChild(radioRow("mh-life-birth-trauma", "unknown", "Не знаю", state.birthTrauma === "unknown"));
  const traumaDetailsRow = document.createElement("div");
  traumaDetailsRow.className = "mh-life-row";
  traumaDetailsRow.hidden = state.birthTrauma !== "yes";
  traumaDetailsRow.appendChild(document.createTextNode("Со слов пациента: "));
  const traumaDetailsInp = document.createElement("input");
  traumaDetailsInp.type = "text";
  traumaDetailsInp.id = "mh-life-birth-trauma-details";
  traumaDetailsInp.className = "mh-life-text";
  traumaDetailsInp.value = String(state.birthTraumaDetails ?? "");
  traumaDetailsRow.appendChild(traumaDetailsInp);
  fsB2.appendChild(traumaDetailsRow);
  fsB2.querySelectorAll('input[name="mh-life-birth-trauma"]').forEach((el) => {
    el.addEventListener("change", () => {
      const tr = fsB2.querySelector('input[name="mh-life-birth-trauma"]:checked');
      const isYes = tr instanceof HTMLInputElement && tr.value === "yes";
      traumaDetailsRow.hidden = !isYes;
      if (!isYes) traumaDetailsInp.value = "";
    });
  });

  contentEl.appendChild(fsB2);

  const fsB3 = fieldset("Блок 3. Раннее развитие");

  const q31 = document.createElement("p");
  q31.className = "mh-life-edu-title";
  q31.textContent = "Вопрос 1. Как протекало Ваше развитие в первый год жизни?";
  fsB3.appendChild(q31);
  fsB3.appendChild(radioRow("mh-life-dev-year", "timely", "Без задержек, своевременно", state.devFirstYear === "timely"));
  fsB3.appendChild(radioRow("mh-life-dev-year", "delay", "С задержками", state.devFirstYear === "delay"));
  fsB3.appendChild(radioRow("mh-life-dev-year", "unknown", "Не знаю", state.devFirstYear === "unknown"));
  const devDelayRow = document.createElement("div");
  devDelayRow.className = "mh-life-row";
  devDelayRow.hidden = state.devFirstYear !== "delay";
  devDelayRow.appendChild(document.createTextNode("Какие именно задержки (через запятую): "));
  const devDelayInp = document.createElement("input");
  devDelayInp.type = "text";
  devDelayInp.id = "mh-life-dev-year-delay-details";
  devDelayInp.className = "mh-life-text";
  devDelayInp.value = String(state.devFirstYearDelayDetails ?? "");
  devDelayRow.appendChild(devDelayInp);
  fsB3.appendChild(devDelayRow);
  fsB3.querySelectorAll('input[name="mh-life-dev-year"]').forEach((el) => {
    el.addEventListener("change", () => {
      const dv = fsB3.querySelector('input[name="mh-life-dev-year"]:checked');
      const show = dv instanceof HTMLInputElement && dv.value === "delay";
      devDelayRow.hidden = !show;
      if (!show) devDelayInp.value = "";
    });
  });

  const q32 = document.createElement("p");
  q32.className = "mh-life-edu-title";
  q32.textContent = "Вопрос 2. Были ли энурез (недержание мочи) после 5 лет?";
  fsB3.appendChild(q32);
  fsB3.appendChild(radioRow("mh-life-enuresis", "yes", "Да, был", state.enuresisAfter5 === "yes"));
  fsB3.appendChild(radioRow("mh-life-enuresis", "no", "Нет", state.enuresisAfter5 === "no"));
  fsB3.appendChild(radioRow("mh-life-enuresis", "unknown", "Не знаю", state.enuresisAfter5 === "unknown"));

  const q33 = document.createElement("p");
  q33.className = "mh-life-edu-title";
  q33.textContent = "Вопрос 3. Были ли ночные страхи, кошмары, снохождения, сноговорения в детстве?";
  fsB3.appendChild(q33);
  fsB3.appendChild(radioRow("mh-life-parasomnia", "yes", "Да, отмечались", state.parasomnia === "yes"));
  fsB3.appendChild(radioRow("mh-life-parasomnia", "no", "Нет", state.parasomnia === "no"));
  fsB3.appendChild(radioRow("mh-life-parasomnia", "unknown", "Не знаю", state.parasomnia === "unknown"));
  const paraSub = document.createElement("div");
  paraSub.className = "mh-life-early-sub";
  paraSub.hidden = state.parasomnia !== "yes";
  paraSub.appendChild(mkCheck("mh-life-para-fears", "Ночные страхи", state.parasomniaNightFears));
  paraSub.appendChild(mkCheck("mh-life-para-nightmares", "Кошмары", state.parasomniaNightmares));
  paraSub.appendChild(mkCheck("mh-life-para-sleepwalk", "Снохождения (лунатизм)", state.parasomniaSleepwalk));
  paraSub.appendChild(mkCheck("mh-life-para-sleeptalk", "Сноговорения (разговоры во сне)", state.parasomniaSleeptalk));
  const paraOtherRow = document.createElement("div");
  paraOtherRow.className = "mh-life-row";
  paraOtherRow.appendChild(document.createTextNode("Свой вариант: "));
  const paraOtherInp = document.createElement("input");
  paraOtherInp.type = "text";
  paraOtherInp.id = "mh-life-para-other";
  paraOtherInp.className = "mh-life-text";
  paraOtherInp.value = String(state.parasomniaOther ?? "");
  paraOtherRow.appendChild(paraOtherInp);
  paraSub.appendChild(paraOtherRow);
  fsB3.appendChild(paraSub);
  fsB3.querySelectorAll('input[name="mh-life-parasomnia"]').forEach((el) => {
    el.addEventListener("change", () => {
      const p = fsB3.querySelector('input[name="mh-life-parasomnia"]:checked');
      const show = p instanceof HTMLInputElement && p.value === "yes";
      paraSub.hidden = !show;
      if (!show) {
        paraOtherInp.value = "";
        paraSub.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          if (cb instanceof HTMLInputElement) cb.checked = false;
        });
      }
    });
  });

  const q34 = document.createElement("p");
  q34.className = "mh-life-edu-title";
  q34.textContent = "Вопрос 4. Посещали ли Вы детский сад?";
  fsB3.appendChild(q34);
  fsB3.appendChild(radioRow("mh-life-kdg", "yes", "Да, посещал", state.kindergartenAttend === "yes"));
  fsB3.appendChild(radioRow("mh-life-kdg", "no", "Нет, не посещал (воспитывался дома)", state.kindergartenAttend === "no"));
  fsB3.appendChild(radioRow("mh-life-kdg", "unknown", "Не знаю", state.kindergartenAttend === "unknown"));

  const q35Wrap = document.createElement("div");
  q35Wrap.className = "mh-life-early-sub";
  q35Wrap.hidden = state.kindergartenAttend !== "yes";
  const q35 = document.createElement("p");
  q35.className = "mh-life-edu-title";
  q35.textContent = "Вопрос 5. Как Вы адаптировались к детскому саду?";
  q35Wrap.appendChild(q35);
  q35Wrap.appendChild(
    radioRow("mh-life-kdg-adapt", "easy", "Адаптировался без особенностей", state.kindergartenAdapt === "easy")
  );
  q35Wrap.appendChild(
    radioRow(
      "mh-life-kdg-adapt",
      "difficult",
      "Были трудности адаптации",
      state.kindergartenAdapt === "difficult"
    )
  );
  q35Wrap.appendChild(radioRow("mh-life-kdg-adapt", "unknown", "Не знаю", state.kindergartenAdapt === "unknown"));
  const adaptDetailsRow = document.createElement("div");
  adaptDetailsRow.className = "mh-life-row";
  adaptDetailsRow.hidden = state.kindergartenAdapt !== "difficult";
  adaptDetailsRow.appendChild(document.createTextNode("Уточнение: "));
  const adaptDetailsInp = document.createElement("input");
  adaptDetailsInp.type = "text";
  adaptDetailsInp.id = "mh-life-kdg-adapt-details";
  adaptDetailsInp.className = "mh-life-text";
  adaptDetailsInp.value = String(state.kindergartenAdaptDetails ?? "");
  adaptDetailsRow.appendChild(adaptDetailsInp);
  q35Wrap.appendChild(adaptDetailsRow);
  q35Wrap.querySelectorAll('input[name="mh-life-kdg-adapt"]').forEach((el) => {
    el.addEventListener("change", () => {
      const a = q35Wrap.querySelector('input[name="mh-life-kdg-adapt"]:checked');
      const show = a instanceof HTMLInputElement && a.value === "difficult";
      adaptDetailsRow.hidden = !show;
      if (!show) adaptDetailsInp.value = "";
    });
  });
  fsB3.appendChild(q35Wrap);
  fsB3.querySelectorAll('input[name="mh-life-kdg"]').forEach((el) => {
    el.addEventListener("change", () => {
      const k = fsB3.querySelector('input[name="mh-life-kdg"]:checked');
      const show = k instanceof HTMLInputElement && k.value === "yes";
      q35Wrap.hidden = !show;
      if (!show) {
        q35Wrap.querySelectorAll('input[name="mh-life-kdg-adapt"]').forEach((r) => {
          if (r instanceof HTMLInputElement) r.checked = false;
        });
        adaptDetailsInp.value = "";
      }
    });
  });

  contentEl.appendChild(fsB3);

  const fsB4 = fieldset("Блок 4. Наблюдались ли вы у специалистов в детстве?");
  fsB4.appendChild(radioRow("mh-life-childhood", "yes", "Да", state.childhoodSpecialists === "yes"));
  fsB4.appendChild(radioRow("mh-life-childhood", "no", "Нет", state.childhoodSpecialists === "no"));

  const chYesWrap = document.createElement("div");
  chYesWrap.id = "mh-life-childhood-yes-wrap";
  chYesWrap.className = "mh-life-childhood-yes-wrap";
  chYesWrap.hidden = state.childhoodSpecialists !== "yes";

  const visitsHint = document.createElement("p");
  visitsHint.className = "mh-life-hint";
  visitsHint.textContent =
    "Для каждого специалиста выберите врача из списка или «Свой вариант», укажите причину наблюдения либо отметьте «Не знаю причину».";
  chYesWrap.appendChild(visitsHint);

  const visitsList = document.createElement("div");
  visitsList.id = "mh-life-childhood-visits-list";
  visitsList.className = "mh-life-childhood-visits-list";

  const visitStates = /** @type {ChildhoodVisit[]} */ (
    state.childhoodSpecialists === "yes"
      ? Array.isArray(state.childhoodVisits) && state.childhoodVisits.length
        ? state.childhoodVisits
        : [{ specialist: "neuro", customOther: "", reason: "", reasonUnknown: false }]
      : []
  );

  function reflowChildhood(mutator) {
    readLifeStructuredFromDom(contentEl, answers);
    const st = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
    mutator(st);
    answers[LIFE_STRUCTURED_ID] = JSON.stringify(st);
    renderLifeStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
  }

  /** @param {ChildhoodVisit} v @param {number} idx @param {number} total */
  function appendChildhoodVisitRow(v, idx, total) {
    const row = document.createElement("div");
    row.className = "mh-life-childhood-visit";
    row.dataset.index = String(idx);

    const rowTitle = document.createElement("p");
    rowTitle.className = "mh-life-childhood-visit-title";
    rowTitle.textContent = `Специалист ${idx + 1}`;
    row.appendChild(rowTitle);

    const specRow = document.createElement("div");
    specRow.className = "mh-life-row";
    specRow.appendChild(document.createTextNode("Врач: "));
    const specSel = document.createElement("select");
    specSel.className = "mh-life-select mh-life-ch-visit-specialist";
    [
      ["neuro", "Врач невролог"],
      ["psych", "Врач психиатр"],
      ["endo", "Врач эндокринолог"],
      ["custom", "Свой вариант"],
    ].forEach(([val, lab]) => {
      const o = document.createElement("option");
      o.value = val;
      o.textContent = lab;
      if (v.specialist === val) o.selected = true;
      specSel.appendChild(o);
    });
    specRow.appendChild(specSel);
    row.appendChild(specRow);

    const customWrap = document.createElement("div");
    customWrap.className = "mh-life-childhood-custom-wrap";
    const customLab = document.createElement("label");
    customLab.className = "mh-life-row";
    customLab.appendChild(document.createTextNode("Укажите врача (как в тексте документа, родительный падеж): "));
    const customInp = document.createElement("input");
    customInp.type = "text";
    customInp.className = "mh-life-text mh-life-ch-visit-custom";
    customInp.placeholder = "например: ортопеда, логопеда";
    customInp.value = String(v.customOther ?? "");
    customLab.appendChild(customInp);
    customWrap.appendChild(customLab);
    customWrap.hidden = v.specialist !== "custom";
    row.appendChild(customWrap);

    specSel.addEventListener("change", () => {
      customWrap.hidden = specSel.value !== "custom";
      if (specSel.value !== "custom" && customInp instanceof HTMLInputElement) customInp.value = "";
    });

    const reasonRow = document.createElement("div");
    reasonRow.className = "mh-life-childhood-reason-row";
    const reasonLab = document.createElement("label");
    reasonLab.appendChild(document.createTextNode("По какой причине: "));
    const reasonInp = document.createElement("input");
    reasonInp.type = "text";
    reasonInp.className = "mh-life-text mh-life-ch-visit-reason";
    reasonInp.disabled = Boolean(v.reasonUnknown);
    reasonInp.value = v.reasonUnknown ? "" : String(v.reason ?? "");
    reasonLab.appendChild(reasonInp);
    reasonRow.appendChild(reasonLab);
    row.appendChild(reasonRow);

    const unLab = document.createElement("label");
    unLab.className = "mh-life-check mh-life-early-unknown-lab";
    const unCb = document.createElement("input");
    unCb.type = "checkbox";
    unCb.className = "mh-life-ch-visit-reason-unknown";
    unCb.checked = Boolean(v.reasonUnknown);
    unLab.appendChild(unCb);
    unLab.appendChild(document.createTextNode(" Не знаю причину"));
    row.appendChild(unLab);

    unCb.addEventListener("change", () => {
      reasonInp.disabled = unCb.checked;
      if (unCb.checked) reasonInp.value = "";
    });

    const actions = document.createElement("div");
    actions.className = "mh-life-childhood-visit-actions";
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "mh-life-heredity-remove";
    delBtn.textContent = "Удалить";
    delBtn.hidden = total <= 1;
    delBtn.addEventListener("click", () => {
      reflowChildhood((st) => {
        const arr = normalizeChildhoodVisits(st.childhoodVisits);
        arr.splice(idx, 1);
        st.childhoodVisits = arr.length ? arr : [{ specialist: "neuro", customOther: "", reason: "", reasonUnknown: false }];
      });
    });
    actions.appendChild(delBtn);
    row.appendChild(actions);

    visitsList.appendChild(row);
  }

  visitStates.forEach((v, idx) => appendChildhoodVisitRow(v, idx, visitStates.length));

  chYesWrap.appendChild(visitsList);

  const addChBtn = document.createElement("button");
  addChBtn.type = "button";
  addChBtn.className = "mh-life-add-case";
  addChBtn.textContent = "Добавить специалиста";
  addChBtn.addEventListener("click", () => {
    reflowChildhood((st) => {
      const arr = normalizeChildhoodVisits(st.childhoodVisits);
      arr.push({ specialist: "neuro", customOther: "", reason: "", reasonUnknown: false });
      st.childhoodVisits = arr;
    });
  });
  chYesWrap.appendChild(addChBtn);

  fsB4.appendChild(chYesWrap);

  fsB4.querySelectorAll('input[name="mh-life-childhood"]').forEach((el) => {
    el.addEventListener("change", () => {
      const inp = contentEl.querySelector('input[name="mh-life-childhood"]:checked');
      chYesWrap.hidden = !(inp instanceof HTMLInputElement && inp.value === "yes");
    });
  });

  contentEl.appendChild(fsB4);

  const fsB6 = fieldset("Блок 6. Школа");
  const rowAge = document.createElement("div");
  rowAge.className = "mh-life-row";
  const labAge = document.createElement("label");
  labAge.appendChild(document.createTextNode("В школу пошёл с "));
  const ageInp = document.createElement("input");
  ageInp.type = "text";
  ageInp.inputMode = "numeric";
  ageInp.className = "mh-life-text mh-life-text--narrow";
  ageInp.id = "mh-life-school-age";
  ageInp.value = String(state.schoolStartAge ?? "");
  labAge.appendChild(ageInp);
  labAge.appendChild(document.createTextNode(" лет"));
  rowAge.appendChild(labAge);
  fsB6.appendChild(rowAge);
  const rowPerf = document.createElement("div");
  rowPerf.className = "mh-life-row";
  rowPerf.appendChild(document.createTextNode("Как учился: "));
  const perfSel = document.createElement("select");
  perfSel.id = "mh-life-school-perf";
  perfSel.className = "mh-life-select";
  [
    ["", "—"],
    ["udarnik", "ударник"],
    ["otlichnik", "отличник"],
    ["horoshist", "хорошист"],
    ["troechnik", "троечник"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    if (state.schoolPerformance === v) o.selected = true;
    perfSel.appendChild(o);
  });
  rowPerf.appendChild(perfSel);
  fsB6.appendChild(rowPerf);
  const rowCl = document.createElement("div");
  rowCl.className = "mh-life-row";
  rowCl.appendChild(document.createTextNode("Сколько классов окончил: "));
  const clSel = document.createElement("select");
  clSel.id = "mh-life-school-classes";
  clSel.className = "mh-life-select";
  const oEmpty = document.createElement("option");
  oEmpty.value = "";
  oEmpty.textContent = "—";
  clSel.appendChild(oEmpty);
  for (let n = 1; n <= 11; n += 1) {
    const o = document.createElement("option");
    o.value = String(n);
    o.textContent = String(n);
    if (state.schoolClasses === n) o.selected = true;
    clSel.appendChild(o);
  }
  rowCl.appendChild(clSel);
  fsB6.appendChild(rowCl);
  contentEl.appendChild(fsB6);

  if (gender === "male") {
    const fsB7 = fieldset("Блок 7. Армия");
    fsB7.appendChild(radioRow("mh-life-army", "served", "Служил", state.army === "served"));
    fsB7.appendChild(radioRow("mh-life-army", "not", "Не служил", state.army === "not"));
    contentEl.appendChild(fsB7);
  }

  const fsB8 = fieldset("Блок 8. Образование");
  fsB8.appendChild(subEdu("Среднее", "sec", state));
  fsB8.appendChild(subEdu("Высшее", "hi", state));
  contentEl.appendChild(fsB8);

  contentEl.querySelectorAll('input[name="mh-life-heredity"]').forEach((el) => {
    el.addEventListener("change", () => syncYesBlock());
  });

  function repopulateSiblingDeg(who) {
    sibSel.innerHTML = "";
    const ox = document.createElement("option");
    ox.value = "";
    ox.textContent = "—";
    sibSel.appendChild(ox);
    if (!needsSiblingDegree(who)) {
      sibSel.disabled = true;
      return;
    }
    const fem = who === "sister" || who === "niece";
    const opts = fem ? SIBLING_DEG_FEM : SIBLING_DEG_MASC;
    opts.forEach(([code, lab]) => {
      const o = document.createElement("option");
      o.value = code;
      o.textContent = lab.charAt(0).toUpperCase() + lab.slice(1);
      sibSel.appendChild(o);
    });
    sibSel.disabled = false;
  }

  /** Только блок линии: не трогать селект степени (иначе при change на степени repopulate сбрасывает выбор). */
  function syncHeredityLineRowOnly() {
    const who = whoSel instanceof HTMLSelectElement ? whoSel.value.trim() : "";
    const sib = sibSel instanceof HTMLSelectElement ? sibSel.value : "";
    const showLine = needsLine(who, sib || undefined);
    fsLine.hidden = !showLine;
    if (!showLine) {
      yesBlock.querySelectorAll('input[name="mh-life-draft-line"]').forEach((el) => {
        if (el instanceof HTMLInputElement) el.checked = false;
      });
    }
  }

  function updatePsychiatristDraftLabel() {
    const span = draftWrap.querySelector("#mh-life-psychiatrist-option-text");
    if (!span) return;
    const who = whoSel instanceof HTMLSelectElement ? whoSel.value.trim() : "";
    span.textContent = ` ${psychiatristOptionUiLabel(who)}`;
  }

  function syncHeredityDraftUi() {
    const who = whoSel instanceof HTMLSelectElement ? whoSel.value.trim() : "";
    fsSib.hidden = !needsSiblingDegree(who);
    repopulateSiblingDeg(who);
    syncHeredityLineRowOnly();
    updatePsychiatristDraftLabel();
  }

  whoSel.addEventListener("change", () => {
    syncHeredityDraftUi();
  });
  sibSel.addEventListener("change", () => {
    syncHeredityLineRowOnly();
  });
  yesBlock.querySelectorAll('input[name="mh-life-draft-line"]').forEach((el) => {
    el.addEventListener("change", () => syncHeredityLineRowOnly());
  });

  /** @param {HeredityCase} draft @returns {{ err: string | null; record: HeredityCase | null }} */
  function draftToCaseOrError(draft) {
    const err = validateHeredityDraft(draft);
    if (err) return { err, record: null };
    /** @type {HeredityCase} */
    const record = {
      who: draft.who,
      pathology: [...draft.pathology],
      pathologyOther: String(draft.pathologyOther ?? "").trim(),
    };
    if (needsSiblingDegree(draft.who) && draft.siblingDegree) record.siblingDegree = draft.siblingDegree;
    if (needsLine(draft.who, record.siblingDegree) && (draft.line === "maternal" || draft.line === "paternal")) record.line = draft.line;
    return { err: null, record };
  }

  /** @param {HeredityCase} draft */
  function isHeredityDraftEmpty(draft) {
    return (
      !String(draft.who ?? "").trim() &&
      !(Array.isArray(draft.pathology) && draft.pathology.length) &&
      !String(draft.pathologyOther ?? "").trim()
    );
  }

  btnAdd.addEventListener("click", () => {
    readLifeStructuredFromDom(contentEl, answers);
    const draft = readHeredityDraftFromDom(yesBlock);
    const { err, record } = draftToCaseOrError(draft);
    if (err || !record) {
      window.alert(err || "Не удалось сохранить.");
      return;
    }
    const st = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
    if (!Array.isArray(st.heredityCases)) st.heredityCases = [];
    st.heredityCases.push(record);
    st.heredityCloseDraft = false;
    answers[LIFE_STRUCTURED_ID] = JSON.stringify(st);
    renderLifeStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
  });

  btnFinish.addEventListener("click", () => {
    readLifeStructuredFromDom(contentEl, answers);
    const draft = readHeredityDraftFromDom(yesBlock);
    const { err, record } = draftToCaseOrError(draft);
    const st = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
    if (!Array.isArray(st.heredityCases)) st.heredityCases = [];

    if (record) {
      st.heredityCases.push(record);
    } else if (err && !isHeredityDraftEmpty(draft)) {
      window.alert(err);
      return;
    }

    st.heredityCloseDraft = true;
    answers[LIFE_STRUCTURED_ID] = JSON.stringify(st);
    renderLifeStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
  });

  function syncYesBlock() {
    readLifeStructuredFromDom(contentEl, answers);
    const st = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
    const sel = contentEl.querySelector('input[name="mh-life-heredity"]:checked');
    const yes = sel && sel.value === "yes";
    listPanel.hidden = !yes;
    yesBlock.hidden = !yes || (yes && st.heredityCloseDraft === true);
  }

  syncHeredityDraftUi();

  if (nextWizardBtn) nextWizardBtn.textContent = qIndex >= stepsLen - 1 ? "Завершить" : "Далее";
}

function mkCheck(id, label, checked) {
  const lab = document.createElement("label");
  lab.className = "mh-life-check";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.id = id;
  cb.checked = Boolean(checked);
  lab.appendChild(cb);
  lab.appendChild(document.createTextNode(` ${label}`));
  return lab;
}

function subEdu(title, prefix, state) {
  const div = document.createElement("div");
  div.className = "mh-life-edu-block";
  const p = document.createElement("p");
  p.className = "mh-life-edu-title";
  p.textContent = title;
  div.appendChild(p);
  const done = prefix === "sec" ? state.eduSecDone : state.eduHiDone;
  const undone = prefix === "sec" ? state.eduSecUndone : state.eduHiUndone;
  const spec = prefix === "sec" ? state.eduSecSpec : state.eduHiSpec;
  const name = `mh-life-edu-${prefix}`;
  div.appendChild(radioRowStatic(name, "done", "Законченное", done));
  div.appendChild(radioRowStatic(name, "undone", "Незаконченное", undone));
  const sp = document.createElement("input");
  sp.type = "text";
  sp.className = "mh-life-text";
  sp.id = `mh-life-edu-${prefix}-spec`;
  sp.placeholder = "Специальность";
  sp.value = String(spec ?? "");
  div.appendChild(sp);
  return div;
}

function radioRowStatic(name, value, label, checked) {
  const lab = document.createElement("label");
  lab.className = "mh-life-radio";
  const inp = document.createElement("input");
  inp.type = "radio";
  inp.name = name;
  inp.value = value;
  inp.checked = Boolean(checked);
  lab.appendChild(inp);
  lab.appendChild(document.createTextNode(` ${label}`));
  return lab;
}

/** @param {HTMLElement} root @returns {ChildhoodVisit[]} */
function readChildhoodVisitsFromDom(root) {
  const out = /** @type {ChildhoodVisit[]} */ ([]);
  root.querySelectorAll(".mh-life-childhood-visit").forEach((visitRow) => {
    const specSel = visitRow.querySelector(".mh-life-ch-visit-specialist");
    const specialist =
      specSel instanceof HTMLSelectElement && CHILDHOOD_SPECIALIST_CODES.has(specSel.value) ? specSel.value : "neuro";
    const customInp = visitRow.querySelector(".mh-life-ch-visit-custom");
    const customOther = customInp instanceof HTMLInputElement ? customInp.value.trim() : "";
    const reasonInp = visitRow.querySelector(".mh-life-ch-visit-reason");
    const reason = reasonInp instanceof HTMLInputElement ? reasonInp.value.trim() : "";
    const un = visitRow.querySelector(".mh-life-ch-visit-reason-unknown");
    const reasonUnknown = un instanceof HTMLInputElement && un.checked;
    out.push({
      specialist,
      customOther: specialist === "custom" ? customOther : "",
      reason: reasonUnknown ? "" : reason,
      reasonUnknown,
    });
  });
  return out;
}

/**
 * @param {HTMLElement} contentEl
 * @param {Record<string, string>} answers
 */
export function readLifeStructuredFromDom(contentEl, answers) {
  const prev = parseLifeStructuredString(answers[LIFE_STRUCTURED_ID]);
  const s = emptyLifeStructuredState();
  const h = contentEl.querySelector('input[name="mh-life-heredity"]:checked');
  s.heredity = h && "value" in h ? h.value : "";

  const hj = contentEl.querySelector("#mh-life-heredity-cases-json");
  if (hj instanceof HTMLTextAreaElement || hj instanceof HTMLInputElement) {
    try {
      const parsed = JSON.parse(hj.value || "[]");
      if (Array.isArray(parsed)) s.heredityCases = parsed.map(normalizeHeredityCase).filter(Boolean);
    } catch {
      s.heredityCases = [];
    }
  }

  const b = contentEl.querySelector('input[name="mh-life-birth"]:checked');
  s.birthFamily = b && "value" in b ? b.value : "";
  s.birthOrder = valOf(contentEl, "#mh-life-birth-order");
  s.birthChildrenTotal = valOf(contentEl, "#mh-life-birth-total");
  const bt = contentEl.querySelector('input[name="mh-life-birth-term"]:checked');
  s.birthTerm = bt && "value" in bt ? bt.value : "";
  const bd = contentEl.querySelector('input[name="mh-life-birth-delivery"]:checked');
  s.birthDelivery = bd && "value" in bd ? bd.value : "";
  const bcourse = contentEl.querySelector('input[name="mh-life-birth-course"]:checked');
  s.birthCourse = bcourse && "value" in bcourse ? bcourse.value : "";
  s.birthCourseDetails = s.birthCourse === "complicated" ? valOf(contentEl, "#mh-life-birth-course-details") : "";
  const btr = contentEl.querySelector('input[name="mh-life-birth-trauma"]:checked');
  s.birthTrauma = btr && "value" in btr ? btr.value : "";
  s.birthTraumaDetails = s.birthTrauma === "yes" ? valOf(contentEl, "#mh-life-birth-trauma-details") : "";
  const dev = contentEl.querySelector('input[name="mh-life-dev-year"]:checked');
  s.devFirstYear = dev && "value" in dev ? dev.value : "";
  s.devFirstYearDelayDetails = s.devFirstYear === "delay" ? valOf(contentEl, "#mh-life-dev-year-delay-details") : "";

  const en = contentEl.querySelector('input[name="mh-life-enuresis"]:checked');
  s.enuresisAfter5 = en && "value" in en ? en.value : "";

  const pa = contentEl.querySelector('input[name="mh-life-parasomnia"]:checked');
  s.parasomnia = pa && "value" in pa ? pa.value : "";
  s.parasomniaNightFears = s.parasomnia === "yes" && chk(contentEl, "#mh-life-para-fears");
  s.parasomniaNightmares = s.parasomnia === "yes" && chk(contentEl, "#mh-life-para-nightmares");
  s.parasomniaSleepwalk = s.parasomnia === "yes" && chk(contentEl, "#mh-life-para-sleepwalk");
  s.parasomniaSleeptalk = s.parasomnia === "yes" && chk(contentEl, "#mh-life-para-sleeptalk");
  s.parasomniaOther = s.parasomnia === "yes" ? valOf(contentEl, "#mh-life-para-other") : "";

  const k = contentEl.querySelector('input[name="mh-life-kdg"]:checked');
  s.kindergartenAttend = k && "value" in k ? k.value : "";
  const ka = contentEl.querySelector('input[name="mh-life-kdg-adapt"]:checked');
  s.kindergartenAdapt = s.kindergartenAttend === "yes" && ka && "value" in ka ? ka.value : "";
  s.kindergartenAdaptDetails =
    s.kindergartenAttend === "yes" && s.kindergartenAdapt === "difficult" ? valOf(contentEl, "#mh-life-kdg-adapt-details") : "";

  const ch = contentEl.querySelector('input[name="mh-life-childhood"]:checked');
  s.childhoodSpecialists =
    ch instanceof HTMLInputElement && (ch.value === "yes" || ch.value === "no")
      ? ch.value
      : typeof prev.childhoodSpecialists === "string" && (prev.childhoodSpecialists === "yes" || prev.childhoodSpecialists === "no")
        ? prev.childhoodSpecialists
        : "";
  if (s.childhoodSpecialists === "yes") {
    s.childhoodVisits = readChildhoodVisitsFromDom(contentEl);
  } else if (s.childhoodSpecialists === "no") {
    s.childhoodVisits = [];
  } else {
    s.childhoodVisits = normalizeChildhoodVisits(prev.childhoodVisits);
  }

  s.schoolStartAge = valOf(contentEl, "#mh-life-school-age");
  s.schoolPerformance = valOf(contentEl, "#mh-life-school-perf");
  const cl = valOf(contentEl, "#mh-life-school-classes");
  if (cl === "") s.schoolClasses = null;
  else {
    const n = Number(cl);
    s.schoolClasses = Number.isFinite(n) && n >= 1 && n <= 11 ? n : null;
  }

  const ar = contentEl.querySelector('input[name="mh-life-army"]:checked');
  s.army = ar && "value" in ar ? ar.value : "";

  const sec = contentEl.querySelector('input[name="mh-life-edu-sec"]:checked');
  s.eduSecDone = sec?.value === "done";
  s.eduSecUndone = sec?.value === "undone";
  s.eduSecSpec = valOf(contentEl, "#mh-life-edu-sec-spec");

  const hi = contentEl.querySelector('input[name="mh-life-edu-hi"]:checked');
  s.eduHiDone = hi?.value === "done";
  s.eduHiUndone = hi?.value === "undone";
  s.eduHiSpec = valOf(contentEl, "#mh-life-edu-hi-spec");

  if (s.heredity === "yes") {
    s.heredityCloseDraft = prev.heredityCloseDraft === true;
  } else {
    s.heredityCloseDraft = false;
  }

  answers[LIFE_STRUCTURED_ID] = JSON.stringify(s);
}

function valOf(root, sel) {
  const el = root.querySelector(sel);
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el.value : "";
}

function chk(root, sel) {
  const el = root.querySelector(sel);
  return el instanceof HTMLInputElement && el.checked;
}
