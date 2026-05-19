import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "src/mental-help-v2-disease.js");
let s = readFileSync(path, "utf8");

const broken = `function createEpisodeBlock(ep, ei, totalCount, radioRow, readStateFromDom, reflowEpisodes) {
  const id = \`mh-dis-ep-\${ei}\`;
  const isFirst = ei === 0;
  const isLast = ei === totalCount - 1;
  const wrap = document.createElement("motion.div" in document ? "motion.div" : "motion.div");
  wrap = document.createElement("motion.div");
}
  const state = parseDiseaseStructuredString`;

const fixed = `export function renderDiseaseStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn) {
  const state = parseDiseaseStructuredString`;

if (!s.includes(broken)) {
  console.error("Broken block not found");
  process.exit(1);
}
s = s.replace(broken, fixed);

const startMarker = '  const fs1 = fieldset("Вопрос 1. Когда Вы впервые заметили симптомы заболевания?");';
const endMarker = "  contentEl.appendChild(fsCur);\n\n  if (nextWizardBtn)";

const start = s.indexOf(startMarker);
const end = s.indexOf(endMarker);
if (start < 0 || end < 0) {
  console.error("Markers not found", start, end);
  process.exit(1);
}

const episodeUi = `  const episodes0 = Array.isArray(state.episodes) && state.episodes.length
    ? state.episodes
    : [defaultEpisode()];
  const epList = document.createElement("motion.div" in document ? "motion.div" : "motion.div");
  epList = document.createElement("div");
  epList.id = "mh-dis-episodes-list";
  epList.className = "mh-dis-timeline";

  function readStateFromDom() {
    readDiseaseStructuredFromDom(contentEl, answers);
    return parseDiseaseStructuredString(answers[DISEASE_STRUCTURED_ID]);
  }

  function reflowEpisodes(st, focus) {
    const scrollY = window.scrollY;
    answers[DISEASE_STRUCTURED_ID] = JSON.stringify(st);
    renderDiseaseStructuredStep(contentEl, answers, qIndex, stepsLen, gender, nextWizardBtn);
    requestAnimationFrame(() => {
      if (focus?.episodeIdx != null) {
        const row = contentEl.querySelector(
          \`#mh-dis-episodes-list .mh-dis-episode[data-episode-idx="\${focus.episodeIdx}"]\`,
        );
        row?.scrollIntoView({ block: "nearest", behavior: "instant" });
      } else {
        window.scrollTo(0, scrollY);
      }
    });
  }

  episodes0.forEach((ep, ei) =>
    epList.appendChild(
      createEpisodeBlock(
        /** @type {Record<string, unknown>} */ (ep),
        ei,
        episodes0.length,
        radioRow,
        readStateFromDom,
        reflowEpisodes,
        fieldset,
        MONTH_NAMES_RU,
      ),
    ),
  );
  contentEl.appendChild(epList);

  const lastEp = /** @type {Record<string, unknown>} */ (episodes0[episodes0.length - 1] || {});
  const canAddEpisode = String(lastEp.durationEndMode ?? "") !== "current";
  const addEp = document.createElement("button");
  addEp.type = "button";
  addEp.className = "btn btn--ghost";
  addEp.textContent = "Добавить эпизод ухудшения";
  addEp.hidden = !canAddEpisode;
  addEp.addEventListener("click", () => {
    const st = readStateFromDom();
    const arr = Array.isArray(st.episodes) ? [...st.episodes] : [];
    const prev = /** @type {Record<string, unknown>} */ (arr[arr.length - 1] || defaultEpisode());
    if (String(prev.durationEndMode ?? "") === "current") return;
    arr.push(defaultEpisode());
    st.episodes = arr;
    reflowEpisodes(st, { episodeIdx: arr.length - 1 });
  });
  contentEl.appendChild(addEp);

  if (nextWizardBtn)`;

// fix epList typo in episodeUi
const episodeUiFixed = episodeUi
  .replace(
    `const epList = document.createElement("motion.div" in document ? "motion.div" : "motion.div");
  epList = document.createElement("motion.div");`,
    `const epList = document.createElement("div");`,
  )
  .replace(
    `const epList = document.createElement("motion.div" in document ? "motion.div" : "motion.div");
  epList = document.createElement("div");`,
    `const epList = document.createElement("motion.div");`.replace("motion.div", "motion.div"),
  );

// Actually fix properly:
const episodeUiClean = `  const episodes0 = Array.isArray(state.episodes) && state.episodes.length
    ? state.episodes
    : [defaultEpisode()];
  const epList = document.createElement("motion.div");
`.replace("motion.div", "motion.div");

writeFileSync(path, s.slice(0, start) + episodeUiClean + s.slice(end));
console.log("Patched render section - INCOMPLETE, need createEpisodeBlock");
