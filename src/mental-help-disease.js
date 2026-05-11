import { initMentalHelpApp } from "./mental-help-app.js";
import { MH_STEPS_DISEASE_ONLY } from "./mental-help-disease-data.js";

initMentalHelpApp({
  wordFileBase: "MentalHelp_anamnez_bolezni",
  wordSubtitle: "Анамнез заболевания (структурированная анкета)",
  steps: MH_STEPS_DISEASE_ONLY,
  diseaseWordPreviewRoot: document.getElementById("mh-disease-word-preview-wrap"),
});
