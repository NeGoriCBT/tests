/**
 * Шаги анкеты Mental Help — вторая версия (структурированный анамнез жизни).
 */

import { MH_STEPS } from "./mental-help-data.js";

const STEPS_WITHOUT_LIFE = MH_STEPS.filter((s) => s.wordKey !== "life");

export const MH_STEPS_V2 = [
  ...STEPS_WITHOUT_LIFE,
  {
    id: "life-structured",
    wordKey: "life",
    codeLabel: "Анамнез жизни",
    prompt: "",
  },
];
