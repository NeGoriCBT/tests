import { initMentalHelpApp } from "./mental-help-app.js";
import { MH_STEPS_V2 } from "./mental-help-v2-data.js";

initMentalHelpApp({
  wordFileBase: "MentalHelp_v2_anketa",
  wordSubtitle: "Вторая версия анкеты",
  steps: MH_STEPS_V2,
});
