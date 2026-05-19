/**
 * Chip-picker для анамнеза заболевания.
 */
import {
  drugIdToPickerLabel,
  drugLabelToId,
  filterDrugPickerSuggestions,
  getDrugPickerEntries,
} from "./mental-help-disease-drugs.js";
import {
  filterEarlySymptomSuggestions,
  getAllEarlySymptomLabels,
} from "./mental-help-disease-early-symptoms-data.js";
import {
  STRESSOR_NONE_LABEL,
  filterStressorSuggestions,
  getAllStressorLabels,
  normalizeStressorsList,
} from "./mental-help-disease-stressors-data.js";
import { filterSomaticSpecialtySuggestions, getAllSomaticSpecialtyLabels } from "./mental-help-disease-somatic-specialties-data.js";

export function createChipPicker(opts) {
  /** @type {string[]} */
  let selected = [...opts.initial];

  const root = document.createElement("div");
  root.className = "mh-early-symptoms-picker";

  const chipsEl = document.createElement("div");
  chipsEl.className = "mh-early-symptoms-chips";
  chipsEl.setAttribute("role", "list");

  const inputWrap = document.createElement("div");
  inputWrap.className = "mh-early-symptoms-input-wrap";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "mh-life-text mh-early-symptoms-input";
  input.autocomplete = "off";
  input.placeholder = opts.placeholder ?? "Начните вводить — появятся подходящие варианты";
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");

  const list = document.createElement("ul");
  list.className = "mh-early-symptoms-suggest";
  list.hidden = true;
  list.setAttribute("role", "listbox");

  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.id = opts.hiddenId;

  /** @type {string[]} */
  let activeSuggestions = [];
  let highlightIdx = -1;

  function syncHidden() {
    hidden.value = selected.join("\n");
  }

  function hideSuggest() {
    list.hidden = true;
    list.replaceChildren();
    activeSuggestions = [];
    highlightIdx = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function addValue(value) {
    const v = String(value ?? "").trim();
    if (!v || selected.includes(v)) return;
    if (opts.mergeOnAdd) selected = opts.mergeOnAdd(v, selected);
    else selected = [...selected, v];
    syncHidden();
    renderChips();
    input.value = "";
    hideSuggest();
    input.focus();
    opts.onChange?.();
  }

  function removeAt(i) {
    selected = selected.filter((_, j) => j !== i);
    syncHidden();
    renderChips();
    input.focus();
    opts.onChange?.();
  }

  function renderChips() {
    chipsEl.replaceChildren();
    selected.forEach((val, i) => {
      const chipLabel = opts.formatChip(val);
      const chip = document.createElement("span");
      chip.className = "mh-early-symptoms-chip";
      chip.setAttribute("role", "listitem");

      const text = document.createElement("span");
      text.className = "mh-early-symptoms-chip-label";
      text.textContent = chipLabel;
      chip.appendChild(text);

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "mh-early-symptoms-chip-remove";
      rm.setAttribute("aria-label", `Удалить «${chipLabel}»`);
      rm.textContent = "×";
      rm.addEventListener("click", () => removeAt(i));
      chip.appendChild(rm);

      chipsEl.appendChild(chip);
    });
  }

  function renderSuggest() {
    const exclude = new Set(selected);
    activeSuggestions = opts.filterSuggestions(input.value, exclude);
    list.replaceChildren();
    highlightIdx = -1;
    if (!activeSuggestions.length) {
      hideSuggest();
      return;
    }
    activeSuggestions.forEach((lab, i) => {
      const li = document.createElement("li");
      li.className = "mh-early-symptoms-suggest-item";
      li.setAttribute("role", "option");
      li.textContent = lab;
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const v = opts.valueFromSuggestion(lab);
        if (v) addValue(v);
      });
      li.addEventListener("mouseenter", () => {
        highlightIdx = i;
        syncHighlight();
      });
      list.appendChild(li);
    });
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    syncHighlight();
  }

  function syncHighlight() {
    list.querySelectorAll(".mh-early-symptoms-suggest-item").forEach((el, i) => {
      if (!(el instanceof HTMLElement)) return;
      el.setAttribute("aria-selected", i === highlightIdx ? "true" : "false");
    });
  }

  input.addEventListener("input", () => renderSuggest());
  input.addEventListener("focus", () => {
    if (input.value.trim()) renderSuggest();
  });
  input.addEventListener("blur", () => {
    window.setTimeout(hideSuggest, 150);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      if (list.hidden) renderSuggest();
      if (!activeSuggestions.length) return;
      e.preventDefault();
      highlightIdx = Math.min(highlightIdx + 1, activeSuggestions.length - 1);
      syncHighlight();
      return;
    }
    if (e.key === "ArrowUp") {
      if (!activeSuggestions.length) return;
      e.preventDefault();
      highlightIdx = Math.max(highlightIdx - 1, 0);
      syncHighlight();
      return;
    }
    if (e.key === "Escape") {
      hideSuggest();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const typed = input.value.trim();
      if (!typed) return;
      const v = opts.valueFromEnter(typed, activeSuggestions, highlightIdx);
      if (v) addValue(v);
    }
    if (e.key === "Backspace" && !input.value && selected.length) {
      removeAt(selected.length - 1);
    }
  });

  inputWrap.appendChild(input);
  inputWrap.appendChild(list);
  root.appendChild(chipsEl);
  root.appendChild(inputWrap);
  root.appendChild(hidden);

  renderChips();
  syncHidden();

  return {
    root,
    hidden,
    getSelected: () => [...selected],
  };
}

/** @param {string[]} initial @param {string} [hiddenId] */
export function createEarlySymptomsChipPicker(initial, hiddenId = "mh-dis-early") {
  return createChipPicker({
    initial,
    hiddenId,
    formatChip: (v) => v,
    filterSuggestions: filterEarlySymptomSuggestions,
    valueFromSuggestion: (s) => s,
    valueFromEnter: (typed, suggestions, highlightIdx) => {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) return suggestions[highlightIdx];
      const exact = getAllEarlySymptomLabels().find((l) => l.toLowerCase() === typed.toLowerCase());
      if (exact) return exact;
      return typed;
    },
  });
}

/**
 * @param {string[]} initialLabels
 * @param {() => void} [onChange]
 */
export function createStressorsChipPicker(initialLabels, onChange, hiddenId = "mh-dis-stressors") {
  return createChipPicker({
    initial: normalizeStressorsList(initialLabels),
    hiddenId,
    formatChip: (v) => v,
    filterSuggestions: filterStressorSuggestions,
    valueFromSuggestion: (label) => label,
    valueFromEnter: (typed, suggestions, highlightIdx) => {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) return suggestions[highlightIdx];
      return getAllStressorLabels().find((l) => l.toLowerCase() === typed.toLowerCase()) ?? null;
    },
    mergeOnAdd: (label, sel) => {
      if (label === STRESSOR_NONE_LABEL) return [STRESSOR_NONE_LABEL];
      return [...sel.filter((l) => l !== STRESSOR_NONE_LABEL && l !== label), label];
    },
    onChange,
  });
}

/** @param {string[]} initial @param {string} [hiddenId] */
export function createSomaticSpecialtyChipPicker(initial, hiddenId = "mh-dis-somatic-specs") {
  return createChipPicker({
    initial,
    hiddenId,
    formatChip: (v) => v,
    filterSuggestions: filterSomaticSpecialtySuggestions,
    valueFromSuggestion: (label) => label,
    valueFromEnter: (typed, suggestions, highlightIdx) => {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) return suggestions[highlightIdx];
      return getAllSomaticSpecialtyLabels().find((l) => l.toLowerCase() === typed.toLowerCase()) ?? null;
    },
    placeholder: "Врач-терапевт, кардиолог, невролог…",
  });
}

/** @param {string} initialDrugId @param {string} hiddenId */
export function createDrugChipPicker(initialDrugId, hiddenId) {
  const id = String(initialDrugId ?? "").trim();
  return createChipPicker({
    initial: id ? [id] : [],
    hiddenId,
    formatChip: (drugId) => drugIdToPickerLabel(drugId, true),
    filterSuggestions: (query, exclude) => filterDrugPickerSuggestions(query, exclude),
    valueFromSuggestion: (label) => drugLabelToId(label),
    valueFromEnter: (typed, suggestions, highlightIdx) => {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        return drugLabelToId(suggestions[highlightIdx]);
      }
      const exact = getDrugPickerEntries().find((e) => e.label.toLowerCase() === typed.toLowerCase());
      return exact ? exact.id : null;
    },
    mergeOnAdd: (drugId) => [drugId],
    placeholder: "Введите препарат — появятся подсказки",
  });
}
