import { initMentalHelpApp } from "./mental-help-app.js";
import { MH_STEPS_LIFE_ONLY } from "./mental-help-life-only-data.js";

initMentalHelpApp({
  wordFileBase: "MentalHelp_anamnez_zhizni",
  wordSubtitle: "Анамнез жизни (отдельная анкета)",
  steps: MH_STEPS_LIFE_ONLY,
  lifeWordPreviewRoot: document.getElementById("mh-life-word-preview-wrap"),
});
