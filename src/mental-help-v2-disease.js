/**
 * Структурированный анамнез заболевания (Mental Help v2).
 */

import { DISEASE_DRUG_CATALOG, allDiseaseDrugIds } from "./mental-help-disease-drugs.js";

export const DISEASE_STRUCTURED_ID = "disease-structured";

const STRESSOR_CODES = [
  ["stress", "Стресс (без уточнения)"],
  ["burnout", "Психологическая перегрузка / выгорание"],
  ["breakup", "Расставание с партнёром / развод"],
  ["death", "Смерть близкого человека"],
  ["jobloss", "Потеря работы / увольнение"],
  ["conflict", "Конфликт в семье или на работе"],
  ["somatic", "Физическая болезнь или травма"],
  ["pregnancy", "Беременность / роды"],
  ["finance", "Финансовые трудности"],
  ["move", "Смена места жительства / переезд"],
  ["legal", "Юридические проблемы / суд / тюрьма"],
  ["none", "Ничего из перечисленного"],
  ["other", "Другое"],
];

const STRESSOR_WORD = {
  stress: "стресс",
  burnout: "хроническая перегрузка",
  breakup: "расставание с партнёром",
  death: "смерть близкого",
  jobloss: "потеря работы",
  conflict: "конфликт",
  somatic: "перенесённое соматическое заболевание/травма",
  pregnancy: "беременность/роды",
  finance: "финансовые трудности",
  move: "переезд",
  legal: "юридические проблемы",
  none: "значимых предшествующих событий не было",
};

const PRIOR_SPEC_OPTIONS = [
  ["psychiatrist", "Врач психиатр"],
  ["psychotherapist", "Врач психотерапевт"],
  ["neurologist", "Врач невролог"],
  ["psychologist", "Психолог"],
  ["therapist", "Терапевт / семейный врач"],
  ["other", "Другой"],
];

const MONTH_NAMES_RU = [
  "",
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

/** Предложный падеж после «в … месяце» */
const MONTH_NAMES_PREP_RU = [
  "",
  "январе",
  "феврале",
  "марте",
  "апреле",
  "мае",
  "июне",
  "июле",
  "августе",
  "сентябре",
  "октябре",
  "ноябре",
  "декабре",
];

function listWithAnd(parts) {
  const p = parts.filter(Boolean);
  if (!p.length) return "";
  if (p.length === 1) return p[0];
  if (p.length === 2) return `${p[0]} и ${p[1]}`;
  return `${p.slice(0, -1).join(", ")} и ${p[p.length - 1]}`;
}

/** Склонение после числа: «1 год», «21 год», «2 года», «5 лет». */
function yearsWordRu(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "лет";
  const k = Math.abs(Math.trunc(num)) % 100;
  const k1 = k % 10;
  if (k > 10 && k < 20) return "лет";
  if (k1 === 1) return "год";
  if (k1 >= 2 && k1 <= 4) return "года";
  return "лет";
}

/** Длинные однородные члены (препараты) — в анамнезе удобнее точка с запятой, чем «и» между абзацами. */
function listWithSemicolons(parts) {
  const p = parts.filter(Boolean);
  if (!p.length) return "";
  return p.join("; ");
}

/** @returns {Record<string, unknown>} */
export function emptyDiseaseStructuredState() {
  return {
    debutMode: "",
    debutMonth: "",
    debutYear: "",
    debutAge: "",
    onset: "",
    earlySymptoms: "",
    stressors: [],
    stressorsOther: "",
    priorDoctor: "",
    priorVisits: [],
    priorMeds: "",
    /** @type {Record<string, { months: string; maxDose: string; effect: string; sides: string; trade: string }>} */
    medEntries: {},
  };
}

/** @param {unknown} raw @param {Record<string, unknown>} base */
function normalizePriorVisit(raw, base) {
  if (!raw || typeof raw !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const specialist = typeof o.specialist === "string" ? o.specialist : "";
  const ok = PRIOR_SPEC_OPTIONS.some(([c]) => c === specialist);
  if (!ok && specialist !== "") return null;
  return {
    specialist: ok ? specialist : "",
    customOther: typeof o.customOther === "string" ? o.customOther : "",
    reason: typeof o.reason === "string" ? o.reason : "",
    reasonUnknown: o.reasonUnknown === true,
  };
}

/** @param {unknown} raw */
export function parseDiseaseStructuredString(jsonStr) {
  const base = emptyDiseaseStructuredState();
  let raw = {};
  try {
    const p = JSON.parse(jsonStr || "{}");
    if (p && typeof p === "object") raw = p;
  } catch {
    raw = {};
  }
  for (const k of Object.keys(base)) {
    if (k === "stressors" && Array.isArray(raw.stressors)) {
      base.stressors = raw.stressors.filter((x) => typeof x === "string");
    } else if (k === "priorVisits" && Array.isArray(raw.priorVisits)) {
      base.priorVisits = raw.priorVisits.map((v) => normalizePriorVisit(v, base)).filter(Boolean);
    } else if (k === "medEntries" && raw.medEntries && typeof raw.medEntries === "object") {
      const me = /** @type {Record<string, unknown>} */ (raw.medEntries);
      for (const id of allDiseaseDrugIds()) {
        const e = me[id];
        if (e && typeof e === "object") {
          const o = /** @type {Record<string, unknown>} */ (e);
          base.medEntries[id] = {
            months: String(o.months ?? ""),
            maxDose: String(o.maxDose ?? ""),
            effect: String(o.effect ?? ""),
            sides: String(o.sides ?? ""),
            trade: String(o.trade ?? ""),
          };
        }
      }
    } else if (k in raw) base[k] = raw[k];
  }
  return base;
}

/** @param {"male" | "female" | null} gender */
function verbAppealedPast(gender) {
  if (gender === "female") return "обращалась";
  if (gender === "male") return "обращался";
  return "обращался(лась)";
}

/** @param {"male" | "female" | null} gender */
function verbNegAppealedPast(gender) {
  if (gender === "female") return "не обращалась";
  if (gender === "male") return "не обращался";
  return "не обращался(лась)";
}

/** @param {"male" | "female" | null} gender */
function verbTookMedPast(gender) {
  if (gender === "female") return "Принимала";
  if (gender === "male") return "Принимал";
  return "Принимал(а)";
}

/** @param {"male" | "female" | null} gender */
function verbNotedSidesPast(gender) {
  if (gender === "female") return "не отмечала";
  if (gender === "male") return "не отмечал";
  return "не отмечал(а)";
}

function specialistPhraseForWord(spec, customOther) {
  if (spec === "psychiatrist") return "врачу-психиатру";
  if (spec === "psychotherapist") return "врачу-психотерапевту";
  if (spec === "neurologist") return "врачу-неврологу";
  if (spec === "psychologist") return "психологу";
  if (spec === "therapist") return "терапевту / семейному врачу";
  if (spec === "other") {
    const o = String(customOther ?? "").trim();
    return o ? `специалисту (${o})` : "другому специалисту";
  }
  return "";
}

/** Только «к кому» + хвост причины — глагол «обращался» ставится один раз на всё перечисление. */
function onePriorVisitDestinationForWord(v) {
  const sp = specialistPhraseForWord(String(v.specialist ?? ""), v.customOther);
  if (!sp) return "";
  let tail = "";
  if (v.reasonUnknown) tail = ", причину не помнит";
  else {
    const r = String(v.reason ?? "").trim();
    if (r) tail = ` по поводу «${r}»`;
  }
  return `к ${sp}${tail}`;
}

function effectWord(e) {
  if (e === "yes") return "лучше";
  if (e === "partial") return "частично";
  if (e === "no") return "нет";
  return "не указано";
}

/**
 * @param {Record<string, unknown>} state
 * @param {"male" | "female" | null} gender
 */
export function formatDiseaseStructuredForWord(state, gender) {
  const lines = [];

  const dm = String(state.debutMode ?? "");
  if (dm === "monthYear") {
    const m = Number(state.debutMonth);
    const y = String(state.debutYear ?? "").trim();
    const mnPrep = m >= 1 && m <= 12 ? MONTH_NAMES_PREP_RU[m] : "";
    const mnNom = m >= 1 && m <= 12 ? MONTH_NAMES_RU[m] : "";
    if (mnPrep && y) lines.push(`Заболевание дебютировало в ${mnPrep} ${y} г.`);
    else if (y) lines.push(`Заболевание дебютировало в ${y} году.`);
    else if (mnNom) lines.push(`Дебют приходится на ${mnNom} (год не указан).`);
  } else if (dm === "age") {
    const a = String(state.debutAge ?? "").trim();
    if (a) {
      const nw = yearsWordRu(a);
      lines.push(`Дебют заболевания в возрасте ${a} ${nw}.`);
    }
  } else if (dm === "unknown") {
    lines.push("Срок дебюта указать затрудняется.");
  }

  const on = String(state.onset ?? "");
  if (on === "gradual") lines.push("Начало заболевания постепенное.");
  else if (on === "acute") lines.push("Начало заболевания острое.");
  else if (on === "unknown") lines.push("Характер начала заболевания неизвестен.");

  const early = String(state.earlySymptoms ?? "").trim();
  if (early) lines.push(`В начале заболевания беспокоило: ${early}.`);

  const stressSel = Array.isArray(state.stressors) ? state.stressors.filter((x) => typeof x === "string") : [];
  const otherT = String(state.stressorsOther ?? "").trim();
  const strBits = [];
  if (stressSel.includes("none")) {
    strBits.push(STRESSOR_WORD.none);
  } else {
    for (const c of stressSel) {
      if (c === "other") {
        if (otherT) strBits.push(otherT);
      } else if (STRESSOR_WORD[c]) strBits.push(STRESSOR_WORD[c]);
    }
  }
  if (strBits.length) lines.push(`Предшествовали: ${listWithAnd(strBits)}.`);

  const pd = String(state.priorDoctor ?? "");
  if (pd === "no") {
    lines.push(`По поводу данного состояния ранее к специалистам ${verbNegAppealedPast(gender)}.`);
  } else if (pd === "yes") {
    const visits = Array.isArray(state.priorVisits) ? state.priorVisits : [];
    const destinations = visits.map((v) => onePriorVisitDestinationForWord(v)).filter(Boolean);
    if (destinations.length) {
      const verb = verbAppealedPast(gender);
      lines.push(`По поводу данного состояния ранее ${verb} ${listWithAnd(destinations)}.`);
    } else lines.push(`По поводу данного состояния ранее ${verbAppealedPast(gender)}; уточнить, к каким специалистам, не удалось.`);
  }

  const pm = String(state.priorMeds ?? "");
  if (pm === "no") {
    lines.push("Психотропная терапия по поводу данного состояния ранее не назначалась.");
  } else if (pm === "yes") {
    const medLines = [];
    const entries = state.medEntries && typeof state.medEntries === "object" ? state.medEntries : {};
    for (const group of DISEASE_DRUG_CATALOG) {
      for (const drug of group.drugs) {
        const e = /** @type {Record<string, string> | undefined} */ (entries[drug.id]);
        if (!e) continue;
        const months = String(e.months ?? "").trim();
        const maxDose = String(e.maxDose ?? "").trim();
        const effect = String(e.effect ?? "").trim();
        const sides = String(e.sides ?? "").trim();
        const trade = String(e.trade ?? "").trim();
        const mol = drug.molecule;
        const tradePart = trade ? `, торговое наименование «${trade}»` : "";
        const effW = effectWord(effect);
        const sidesPart = sides ? sides : verbNotedSidesPast(gender);
        const parts = [
          `${mol}${tradePart}`,
          months ? `приём в течение ${months} мес.` : "",
          maxDose ? `максимальная суточная доза ${maxDose}` : "",
          `эффект ${effW}`,
          `побочные эффекты: ${sidesPart}`,
        ].filter(Boolean);
        if (parts.length) medLines.push(parts.join(", "));
      }
    }
    if (medLines.length) {
      const body = medLines.length >= 2 ? listWithSemicolons(medLines) : medLines[0];
      lines.push(`Ранее отмечался приём психотропных препаратов: ${body}.`);
    } else {
      lines.push("Психотропное лечение назначалось; сведения о конкретных препаратах в анкете не указаны.");
    }
  }

  return lines.join("\n\n").trim();
}

/**
 * @param {HTMLElement} root
 * @param {Record<string, string>} answers
 */
export function readDiseaseStructuredFromDom(root, answers) {
  const s = /** @type {Record<string, unknown>} */ (emptyDiseaseStructuredState());

  const debut = root.querySelector('input[name="mh-dis-debut"]:checked');
  s.debutMode = debut instanceof HTMLInputElement ? debut.value : "";
  s.debutMonth = valOf(root, "#mh-dis-debut-month");
  s.debutYear = valOf(root, "#mh-dis-debut-year");
  s.debutAge = valOf(root, "#mh-dis-debut-age");

  const onset = root.querySelector('input[name="mh-dis-onset"]:checked');
  s.onset = onset instanceof HTMLInputElement ? onset.value : "";

  s.earlySymptoms = valOf(root, "#mh-dis-early");

  /** @type {string[]} */
  const stress = [];
  STRESSOR_CODES.forEach(([code]) => {
    const cb = root.querySelector(`#mh-dis-str-${code}`);
    if (cb instanceof HTMLInputElement && cb.checked) stress.push(code);
  });
  if (stress.includes("none")) s.stressors = ["none"];
  else s.stressors = stress;
  s.stressorsOther = valOf(root, "#mh-dis-str-other");

  const pd = root.querySelector('input[name="mh-dis-prior-doc"]:checked');
  s.priorDoctor = pd instanceof HTMLInputElement ? pd.value : "";
  /** @type {unknown[]} */
  const visits = [];
  if (s.priorDoctor === "yes") {
    root.querySelectorAll(".mh-dis-prior-visit").forEach((row) => {
      if (!(row instanceof HTMLElement)) return;
      const sel = row.querySelector(".mh-dis-prior-spec");
      const specialist = sel instanceof HTMLSelectElement ? sel.value : "";
      const reason = row.querySelector(".mh-dis-prior-reason");
      const ru = row.querySelector(".mh-dis-prior-reason-unknown");
      const co = row.querySelector(".mh-dis-prior-custom");
      visits.push({
        specialist,
        customOther: co instanceof HTMLInputElement ? co.value : "",
        reason: reason instanceof HTMLInputElement ? reason.value : "",
        reasonUnknown: ru instanceof HTMLInputElement ? ru.checked : false,
      });
    });
  }
  s.priorVisits = visits.filter(
    (v) => v && typeof v === "object" && String(/** @type {{ specialist?: string }} */ (v).specialist ?? "").trim()
  );

  const pm = root.querySelector('input[name="mh-dis-prior-med"]:checked');
  s.priorMeds = pm instanceof HTMLInputElement ? pm.value : "";

  /** @type {Record<string, { months: string; maxDose: string; effect: string; sides: string; trade: string }>} */
  const medEntries = {};
  if (s.priorMeds === "yes") {
    for (const id of allDiseaseDrugIds()) {
      const use = root.querySelector(`#mh-dis-med-${id}-use`);
      if (!(use instanceof HTMLInputElement) || !use.checked) continue;
      medEntries[id] = {
        months: valOf(root, `#mh-dis-med-${id}-months`),
        maxDose: valOf(root, `#mh-dis-med-${id}-dose`),
        effect: valOf(root, `#mh-dis-med-${id}-effect`),
        sides: valOf(root, `#mh-dis-med-${id}-sides`),
        trade: valOf(root, `#mh-dis-med-${id}-trade`),
      };
    }
  }
  s.medEntries = medEntries;

  answers[DISEASE_STRUCTURED_ID] = JSON.stringify(s);
}

function valOf(root, sel) {
  const el = root.querySelector(sel);
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
    ? el.value.trim()
    : "";
}

/**
 * @param {HTMLElement} contentEl
 * @param {Record<string, string>} answers
 * @param {number} qIndex
 * @param {number} stepsLen
 * @param {"male" | "female" | null} gender
 * @param {HTMLButtonElement | null} nextWizardBtn
 */
export function renderDiseaseStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn) {
  const state = parseDiseaseStructuredString(answers[DISEASE_STRUCTURED_ID]);
  contentEl.replaceChildren();

  const progressEl = contentEl.closest(".mh-step")?.querySelector(".mh-progress");
  if (progressEl) progressEl.textContent = `Шаг опросника: ${qIndex + 1} из ${stepsLen}`;

  const h2 = document.createElement("h2");
  h2.className = "mh-block-title";
  h2.textContent = "Анамнез заболевания";
  contentEl.appendChild(h2);
  const intro = document.createElement("p");
  intro.className = "mh-prompt";
  intro.textContent = "Заполните поля ниже — текст для Word формируется по правилам блока.";
  contentEl.appendChild(intro);

  function fieldset(title) {
    const fs = document.createElement("fieldset");
    fs.className = "mh-life-fieldset";
    if (title) {
      const leg = document.createElement("legend");
      leg.className = "mh-life-legend";
      leg.textContent = title;
      fs.appendChild(leg);
    }
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

  function mkCheck(id, label, checked) {
    const lab = document.createElement("label");
    lab.className = "mh-life-check";
    const inp = document.createElement("input");
    inp.type = "checkbox";
    inp.id = id;
    inp.checked = checked;
    lab.appendChild(inp);
    lab.appendChild(document.createTextNode(` ${label}`));
    return lab;
  }

  const fs1 = fieldset("Вопрос 1. Когда Вы впервые заметили симптомы заболевания?");
  fs1.appendChild(radioRow("mh-dis-debut", "monthYear", "Месяц и год", state.debutMode === "monthYear"));
  fs1.appendChild(radioRow("mh-dis-debut", "age", "Возраст (лет)", state.debutMode === "age"));
  fs1.appendChild(radioRow("mh-dis-debut", "unknown", "Не помню", state.debutMode === "unknown"));
  const debutWrap = document.createElement("div");
  debutWrap.className = "mh-life-custom-wrap";
  const rowMy = document.createElement("div");
  rowMy.className = "mh-life-row";
  rowMy.appendChild(document.createTextNode("Месяц: "));
  const selM = document.createElement("select");
  selM.id = "mh-dis-debut-month";
  selM.className = "mh-life-select";
  const o0 = document.createElement("option");
  o0.value = "";
  o0.textContent = "—";
  selM.appendChild(o0);
  for (let m = 1; m <= 12; m += 1) {
    const o = document.createElement("option");
    o.value = String(m);
    o.textContent = MONTH_NAMES_RU[m];
    if (String(state.debutMonth) === String(m)) o.selected = true;
    selM.appendChild(o);
  }
  rowMy.appendChild(selM);
  rowMy.appendChild(document.createTextNode(" Год: "));
  const selY = document.createElement("select");
  selY.id = "mh-dis-debut-year";
  selY.className = "mh-life-select";
  const oy0 = document.createElement("option");
  oy0.value = "";
  oy0.textContent = "—";
  selY.appendChild(oy0);
  const yNow = new Date().getFullYear();
  for (let y = yNow; y >= 1950; y -= 1) {
    const o = document.createElement("option");
    o.value = String(y);
    o.textContent = String(y);
    if (String(state.debutYear) === String(y)) o.selected = true;
    selY.appendChild(o);
  }
  rowMy.appendChild(selY);
  debutWrap.appendChild(rowMy);
  const rowAge = document.createElement("div");
  rowAge.className = "mh-life-row";
  rowAge.appendChild(document.createTextNode("Возраст (полных лет): "));
  const inpAge = document.createElement("input");
  inpAge.type = "number";
  inpAge.min = "0";
  inpAge.max = "120";
  inpAge.id = "mh-dis-debut-age";
  inpAge.className = "mh-life-text mh-life-text--narrow";
  inpAge.value = String(state.debutAge ?? "");
  rowAge.appendChild(inpAge);
  debutWrap.appendChild(rowAge);
  fs1.appendChild(debutWrap);
  function syncDebut() {
    const r = fs1.querySelector('input[name="mh-dis-debut"]:checked');
    const v = r instanceof HTMLInputElement ? r.value : "";
    rowMy.hidden = v !== "monthYear";
    rowAge.hidden = v !== "age";
  }
  fs1.querySelectorAll('input[name="mh-dis-debut"]').forEach((el) => el.addEventListener("change", syncDebut));
  syncDebut();
  contentEl.appendChild(fs1);

  const fs2 = fieldset("Вопрос 2. Как началось заболевание?");
  fs2.appendChild(radioRow("mh-dis-onset", "gradual", "Постепенно", state.onset === "gradual"));
  fs2.appendChild(radioRow("mh-dis-onset", "acute", "Быстро", state.onset === "acute"));
  fs2.appendChild(radioRow("mh-dis-onset", "unknown", "Не помню", state.onset === "unknown"));
  contentEl.appendChild(fs2);

  const fs3 = fieldset("Вопрос 3. Что Вас беспокоило в начале заболевания?");
  const ta3 = document.createElement("textarea");
  ta3.id = "mh-dis-early";
  ta3.className = "mh-textarea";
  ta3.rows = 3;
  ta3.value = String(state.earlySymptoms ?? "");
  fs3.appendChild(ta3);
  contentEl.appendChild(fs3);

  const fs4 = fieldset("Вопрос 4. Что происходило в жизни незадолго до начала или перед ухудшением?");
  STRESSOR_CODES.forEach(([code, label]) => {
    const arr = Array.isArray(state.stressors) ? state.stressors : [];
    fs4.appendChild(mkCheck(`mh-dis-str-${code}`, label, arr.includes(code)));
  });
  const othRow = document.createElement("div");
  othRow.className = "mh-life-row";
  othRow.appendChild(document.createTextNode("Уточнение для «Другое»: "));
  const othInp = document.createElement("input");
  othInp.type = "text";
  othInp.id = "mh-dis-str-other";
  othInp.className = "mh-life-text";
  othInp.value = String(state.stressorsOther ?? "");
  othRow.appendChild(othInp);
  fs4.appendChild(othRow);
  fs4.querySelectorAll('input[id^="mh-dis-str-"]').forEach((el) => {
    if (!(el instanceof HTMLInputElement) || el.id === "mh-dis-str-other") return;
    el.addEventListener("change", () => {
      if (el.checked && el.id === "mh-dis-str-none") {
        fs4.querySelectorAll('input[id^="mh-dis-str-"]').forEach((x) => {
          if (x instanceof HTMLInputElement && x.type === "checkbox" && x.id !== "mh-dis-str-none") x.checked = false;
        });
      } else if (el.checked && el.id !== "mh-dis-str-none") {
        const n = fs4.querySelector("#mh-dis-str-none");
        if (n instanceof HTMLInputElement) n.checked = false;
      }
    });
  });
  contentEl.appendChild(fs4);

  const fs5 = fieldset("Вопрос 5. Обращались ли к врачу по поводу симптомов раньше?");
  fs5.appendChild(radioRow("mh-dis-prior-doc", "no", "Нет", state.priorDoctor === "no"));
  fs5.appendChild(radioRow("mh-dis-prior-doc", "yes", "Да", state.priorDoctor === "yes"));
  const visWrap = document.createElement("div");
  visWrap.className = "mh-life-early-sub";
  visWrap.id = "mh-dis-prior-vis-wrap";
  const visList = document.createElement("div");
  visList.id = "mh-dis-prior-vis-list";
  visWrap.appendChild(visList);
  fs5.appendChild(visWrap);
  visWrap.hidden = state.priorDoctor !== "yes";

  function readStateFromDom() {
    readDiseaseStructuredFromDom(contentEl, answers);
    return parseDiseaseStructuredString(answers[DISEASE_STRUCTURED_ID]);
  }

  function reflowVisits(st) {
    answers[DISEASE_STRUCTURED_ID] = JSON.stringify(st);
    renderDiseaseStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
  }

  function renderVisitRow(v, idx) {
    const row = document.createElement("div");
    row.className = "mh-dis-prior-visit mh-life-childhood-visit";
    const t = document.createElement("p");
    t.className = "mh-life-childhood-visit-title";
    t.textContent = `Визит ${idx + 1}`;
    row.appendChild(t);
    const sel = document.createElement("select");
    sel.className = "mh-life-select mh-dis-prior-spec";
    PRIOR_SPEC_OPTIONS.forEach(([val, lab]) => {
      const o = document.createElement("option");
      o.value = val;
      o.textContent = lab;
      if (v.specialist === val) o.selected = true;
      sel.appendChild(o);
    });
    row.appendChild(sel);
    const cust = document.createElement("input");
    cust.type = "text";
    cust.className = "mh-life-text mh-dis-prior-custom";
    cust.placeholder = "Если «Другой» — уточнение";
    cust.value = String(v.customOther ?? "");
    row.appendChild(cust);
    const rLab = document.createElement("label");
    rLab.className = "mh-life-check";
    const rUn = document.createElement("input");
    rUn.type = "checkbox";
    rUn.className = "mh-dis-prior-reason-unknown";
    rUn.checked = v.reasonUnknown === true;
    rLab.appendChild(rUn);
    rLab.appendChild(document.createTextNode(" Не помню причину"));
    row.appendChild(rLab);
    const rInp = document.createElement("input");
    rInp.type = "text";
    rInp.className = "mh-life-text mh-dis-prior-reason";
    rInp.placeholder = "По какой причине обращались?";
    rInp.value = String(v.reason ?? "");
    row.appendChild(rInp);
    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn btn--ghost";
    del.textContent = "Удалить";
    del.addEventListener("click", () => {
      const st = readStateFromDom();
      const arr = Array.isArray(st.priorVisits) ? [...st.priorVisits] : [];
      arr.splice(idx, 1);
      st.priorVisits = arr.length ? arr : [{ specialist: "psychiatrist", customOther: "", reason: "", reasonUnknown: false }];
      reflowVisits(st);
    });
    row.appendChild(del);
    return row;
  }

  const visits0 =
    Array.isArray(state.priorVisits) && state.priorVisits.length
      ? state.priorVisits
      : [{ specialist: "psychiatrist", customOther: "", reason: "", reasonUnknown: false }];
  visits0.forEach((v, i) => visList.appendChild(renderVisitRow(v, i)));
  const addVis = document.createElement("button");
  addVis.type = "button";
  addVis.className = "btn btn--ghost";
  addVis.textContent = "Добавить визит";
  addVis.addEventListener("click", () => {
    const st = readStateFromDom();
    const arr = Array.isArray(st.priorVisits) ? [...st.priorVisits] : [];
    arr.push({ specialist: "psychiatrist", customOther: "", reason: "", reasonUnknown: false });
    st.priorVisits = arr;
    reflowVisits(st);
  });
  visWrap.appendChild(addVis);

  fs5.querySelectorAll('input[name="mh-dis-prior-doc"]').forEach((el) => {
    el.addEventListener("change", () => {
      const r = fs5.querySelector('input[name="mh-dis-prior-doc"]:checked');
      visWrap.hidden = !(r instanceof HTMLInputElement && r.value === "yes");
    });
  });
  contentEl.appendChild(fs5);

  const fs6 = fieldset("Вопрос 6. Назначалось ли лечение по поводу симптомов ранее?");
  fs6.appendChild(radioRow("mh-dis-prior-med", "no", "Нет", state.priorMeds === "no"));
  fs6.appendChild(radioRow("mh-dis-prior-med", "yes", "Да", state.priorMeds === "yes"));
  const medWrap = document.createElement("div");
  medWrap.className = "mh-life-early-sub";
  medWrap.id = "mh-dis-med-wrap";
  medWrap.hidden = state.priorMeds !== "yes";
  fs6.querySelectorAll('input[name="mh-dis-prior-med"]').forEach((el) => {
    el.addEventListener("change", () => {
      const r = fs6.querySelector('input[name="mh-dis-prior-med"]:checked');
      medWrap.hidden = !(r instanceof HTMLInputElement && r.value === "yes");
    });
  });

  const entries = state.medEntries && typeof state.medEntries === "object" ? state.medEntries : {};
  for (const group of DISEASE_DRUG_CATALOG) {
    const gfs = fieldset(group.title);
    for (const drug of group.drugs) {
      const e = entries[drug.id] || { months: "", maxDose: "", effect: "", sides: "", trade: "" };
      const row = document.createElement("div");
      row.className = "mh-life-custom-wrap";
      const useId = `mh-dis-med-${drug.id}-use`;
      row.appendChild(mkCheck(useId, `${drug.molecule} (${drug.brands})`, Boolean(entries[drug.id])));
      const sub = document.createElement("div");
      sub.className = "mh-life-early-sub";
      sub.id = `mh-dis-med-${drug.id}-sub`;
      sub.hidden = !entries[drug.id];
      const r1 = document.createElement("div");
      r1.className = "mh-life-row";
      r1.appendChild(document.createTextNode("Срок приёма (мес.): "));
      const mInp = document.createElement("input");
      mInp.type = "number";
      mInp.min = "0";
      mInp.className = "mh-life-text mh-life-text--narrow";
      mInp.id = `mh-dis-med-${drug.id}-months`;
      mInp.value = String(e.months ?? "");
      r1.appendChild(mInp);
      sub.appendChild(r1);
      const r2 = document.createElement("div");
      r2.className = "mh-life-row";
      r2.appendChild(document.createTextNode("Макс. суточная доза: "));
      const dInp = document.createElement("input");
      dInp.type = "text";
      dInp.className = "mh-life-text";
      dInp.id = `mh-dis-med-${drug.id}-dose`;
      dInp.value = String(e.maxDose ?? "");
      r2.appendChild(dInp);
      sub.appendChild(r2);
      const r3 = document.createElement("div");
      r3.className = "mh-life-row";
      r3.appendChild(document.createTextNode("Торговое наименование (если помните): "));
      const tInp = document.createElement("input");
      tInp.type = "text";
      tInp.className = "mh-life-text";
      tInp.id = `mh-dis-med-${drug.id}-trade`;
      tInp.value = String(e.trade ?? "");
      r3.appendChild(tInp);
      sub.appendChild(r3);
      const ef = document.createElement("select");
      ef.id = `mh-dis-med-${drug.id}-effect`;
      ef.className = "mh-life-select";
      [
        ["", "Стало лучше? —"],
        ["yes", "Да"],
        ["partial", "Частично"],
        ["no", "Нет"],
      ].forEach(([val, lab]) => {
        const o = document.createElement("option");
        o.value = val;
        o.textContent = lab;
        if (String(e.effect) === val) o.selected = true;
        ef.appendChild(o);
      });
      sub.appendChild(ef);
      const sInp = document.createElement("input");
      sInp.type = "text";
      sInp.className = "mh-life-text";
      sInp.id = `mh-dis-med-${drug.id}-sides`;
      sInp.placeholder = "Побочные реакции (необязательно)";
      sInp.value = String(e.sides ?? "");
      sub.appendChild(sInp);
      row.appendChild(sub);
      const useCb = row.querySelector(`#${useId}`);
      if (useCb instanceof HTMLInputElement) {
        useCb.addEventListener("change", () => {
          sub.hidden = !useCb.checked;
          if (!useCb.checked) {
            mInp.value = "";
            dInp.value = "";
            tInp.value = "";
            ef.value = "";
            sInp.value = "";
          }
        });
      }
      gfs.appendChild(row);
    }
    medWrap.appendChild(gfs);
  }
  fs6.appendChild(medWrap);
  contentEl.appendChild(fs6);

  if (nextWizardBtn) nextWizardBtn.textContent = qIndex >= stepsLen - 1 ? "Завершить" : "Далее";
}
