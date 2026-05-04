/** Имя группы радиокнопок «пол» на шаге перед вопросами опросника. */

export const PATIENT_GENDER_NAME = "patient-gender";

/** @returns {"male" | "female" | null} */
export function getSelectedPatientGender() {
  const el = document.querySelector(`input[name="${PATIENT_GENDER_NAME}"]:checked`);
  if (!(el instanceof HTMLInputElement)) return null;
  if (el.value === "male" || el.value === "female") return el.value;
  return null;
}

/** @param {"male" | "female" | null | undefined} v */
export function formatPatientGenderRu(v) {
  if (v === "male") return "Мужской";
  if (v === "female") return "Женский";
  return null;
}
