#!/usr/bin/env python3
"""
Читает reference/MentalHelp_early_symptoms_checkbox_to_word.docx и текущий
src/mental-help-disease-early-symptoms-data.js — пересобирает SOURCE (подписи
и хвосты после «—»), HEADINGS, WORD_BLOCKS и src/mental-help-disease-early-symptoms-past.js
"""
from __future__ import annotations

import html
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "reference/MentalHelp_early_symptoms_checkbox_to_word.docx"
DATA_JS = ROOT / "src/mental-help-disease-early-symptoms-data.js"
PAST_JS = ROOT / "src/mental-help-disease-early-symptoms-past.js"


def cell_texts(tr: str) -> list[str]:
    cells = re.findall(r"<w:tc(?:[^>]*)>([\s\S]*?)</w:tc>", tr)
    out: list[str] = []
    for cell in cells:
        texts = re.findall(r"<w:t[^>]*>([^<]*)</w:t>", cell)
        s = "".join(html.unescape(t) for t in texts).strip()
        out.append(s)
    return out


def read_doc_rows() -> list[dict[str, str]]:
    with zipfile.ZipFile(DOCX) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    rows_xml = re.findall(r"<w:tr(?:[^>]*)>([\s\S]*?)</w:tr>", xml)
    parsed: list[list[str]] = []
    for tr in rows_xml:
        cells = cell_texts(tr)
        if len(cells) >= 4:
            parsed.append(cells[:4])
    rows: list[dict[str, str]] = []
    for c in parsed[1:]:
        if "Пример итоговой" in "".join(c):
            break
        sec = c[0]
        if sec.lower() == "телесные симптомы":
            sec = "Телесные симптомы"
        rows.append(
            {
                "section": sec,
                "label": c[1],
                "wordHeader": c[2],
                "past": c[3],
            }
        )
    return rows


def parse_old_source(text: str) -> tuple[str, dict[str, list[tuple[str, str]]]]:
    m = re.search(
        r"export const EARLY_SYMPTOMS_SOURCE = `([\s\S]*?)`\.trim\(\)", text
    )
    if not m:
        raise SystemExit("EARLY_SYMPTOMS_SOURCE not found")
    body = m.group(1)
    headings = {
        "Настроение",
        "Тревога и страхи",
        "Телесные симптомы",
        "Сон",
        "Аппетит и еда",
        "Память и внимание",
        "Навязчивые мысли и действия",
        "Навязчивые мысли (прокручивание в голове)",
        "Навязчивые действия (ритуалы)",
        "Поведение",
        "Энергия и активность",
        "Общение с людьми",
        "Интимная сфера",
        "Алкоголь, курение, успокоительные (способы справиться)",
        "Последствия из-за алкоголя или веществ",
        "Мысли о смерти",
    }
    cur = ""
    sections: dict[str, list[tuple[str, str]]] = {}
    for raw in body.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if line in headings:
            cur = line
            sections.setdefault(cur, [])
            continue
        if "—" in line:
            a, b = line.split("—", 1)
            sections[cur].append((a.strip(), b.strip()))
        else:
            sections[cur].append((line, ""))
    return body, sections


def doc_section_to_source_heading(sec: str) -> str:
    if sec.startswith("Настроение и эмоцион"):
        return "Настроение и эмоциональная сфера"
    if sec.startswith("Алкоголь"):
        return "Алкоголь, курение, успокоительные (способы справиться)"
    if sec.startswith("Последствия"):
        return "Последствия из-за алкоголя или веществ"
    return sec


def hint_for_old_section(
    old_key: str, doc_labels: list[str], old_rows: list[tuple[str, str]]
) -> list[str]:
    """По позиции в секции возвращает хвост после «—» для каждой строки doc."""
    n, m = len(doc_labels), len(old_rows)
    tails: list[str] = []

    if old_key == "Настроение":
        for j in range(n):
            tails.append(old_rows[j][1] if j < m else "")
        return tails

    if old_key == "Сон":
        # old 15 -> doc 14; old индексы для подсказок
        old_idx = [0, 1, 2, 3, 4, 8, 6, 7, 9, 10, 11, 12, 13, 14]
        return [old_rows[i][1] if i < m else "" for i in old_idx]

    if old_key == "Телесные симптомы":
        old_idx = list(range(26)) + [26, 27, 27, 28]
        # 25: Скачки АД <- давление; 27-28 бледность/покраснение <- одна строка; 29 холодные
        return [old_rows[i][1] if i < m else "" for i in old_idx]

    if old_key == "Интимная сфера":
        old_idx = [0, 1, 2, 3, 5, 6]
        return [old_rows[i][1] if i < m else "" for i in old_idx]

    for j in range(n):
        tails.append(old_rows[j][1] if j < m else "")
    return tails


def build_source_string(
    section_order: list[str],
    grouped_doc: dict[str, list[dict]],
    old_sections: dict[str, list[tuple[str, str]]],
) -> str:
    lines: list[str] = []

    def emit_block(heading: str, old_key: str, doc_list: list[dict]) -> None:
        lines.append(heading)
        old_rows = old_sections.get(old_key, [])
        doc_labels = [r["label"] for r in doc_list]
        tails = hint_for_old_section(old_key, doc_labels, old_rows)
        for lab, tail in zip(doc_labels, tails):
            if tail:
                lines.append(f"{lab} — {tail}")
            else:
                lines.append(lab)
        lines.append("")

    for heading in section_order:
        if heading == "НАВЯЗЧИВЫЕ_БЛОК":
            lines.append("Навязчивые мысли и действия")
            lines.append("")
            emit_block(
                "Навязчивые мысли (прокручивание в голове)",
                "Навязчивые мысли (прокручивание в голове)",
                grouped_doc.get("Навязчивые мысли (прокручивание в голове)", []),
            )
            emit_block(
                "Навязчивые действия (ритуалы)",
                "Навязчивые действия (ритуалы)",
                grouped_doc.get("Навязчивые действия (ритуалы)", []),
            )
            continue
        old_key = (
            "Настроение"
            if heading == "Настроение и эмоциональная сфера"
            else heading
        )
        emit_block(heading, old_key, grouped_doc.get(heading, []))

    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines) + "\n"


def main() -> None:
    rows = read_doc_rows()
    data_text = DATA_JS.read_text(encoding="utf-8")
    _, old_sections = parse_old_source(data_text)

    grouped: dict[str, list[dict]] = {}
    for r in rows:
        h = doc_section_to_source_heading(r["section"])
        grouped.setdefault(h, []).append(r)

    section_order = [
        "Настроение и эмоциональная сфера",
        "Тревога и страхи",
        "Телесные симптомы",
        "Сон",
        "Аппетит и еда",
        "Память и внимание",
        "НАВЯЗЧИВЫЕ_БЛОК",
        "Поведение",
        "Энергия и активность",
        "Общение с людьми",
        "Интимная сфера",
        "Алкоголь, курение, успокоительные (способы справиться)",
        "Последствия из-за алкоголя или веществ",
        "Мысли о смерти",
    ]

    new_body = build_source_string(section_order, grouped, old_sections)

    headings_block = """export const EARLY_SYMPTOMS_HEADINGS = new Set([
  "Настроение и эмоциональная сфера",
  "Тревога и страхи",
  "Телесные симптомы",
  "Сон",
  "Аппетит и еда",
  "Память и внимание",
  "Навязчивые мысли и действия",
  "Навязчивые мысли (прокручивание в голове)",
  "Навязчивые действия (ритуалы)",
  "Поведение",
  "Энергия и активность",
  "Общение с людьми",
  "Интимная сфера",
  "Алкоголь, курение, успокоительные (способы справиться)",
  "Последствия из-за алкоголя или веществ",
  "Мысли о смерти",
]);"""

    word_blocks = """export const EARLY_SYMPTOMS_WORD_BLOCKS = /** @type {const} */ ([
  { header: "настроение и эмоциональная сфера", sections: ["Настроение и эмоциональная сфера"] },
  { header: "тревога и страхи", sections: ["Тревога и страхи"] },
  { header: "телесные симптомы", sections: ["Телесные симптомы"] },
  { header: "нарушения сна", sections: ["Сон"] },
  { header: "нарушения аппетита", sections: ["Аппетит и еда"] },
  { header: "когнитивные нарушения", sections: ["Память и внимание"] },
  {
    header: "навязчивости",
    sections: [
      "Навязчивые мысли (прокручивание в голове)",
      "Навязчивые действия (ритуалы)",
    ],
  },
  { header: "поведенческие изменения", sections: ["Поведение", "Общение с людьми"] },
  { header: "энергия", sections: ["Энергия и активность"] },
  { header: "интимная сфера", sections: ["Интимная сфера"] },
  {
    header: "самолечение",
    sections: ["Алкоголь, курение, успокоительные (способы справиться)"],
  },
  {
    header: "последствия употребления алкоголя или веществ",
    sections: ["Последствия из-за алкоголя или веществ"],
  },
  { header: "мысли о смерти", sections: ["Мысли о смерти"] },
]);"""

    new_source_literal = f"export const EARLY_SYMPTOMS_SOURCE = `\n{new_body}`".rstrip() + ".trim();\n"

    data_text = re.sub(
        r"export const EARLY_SYMPTOMS_SOURCE = `[\s\S]*?`\.trim\(\);\n",
        new_source_literal,
        data_text,
        count=1,
    )
    data_text = re.sub(
        r"export const EARLY_SYMPTOMS_HEADINGS = new Set\(\[[\s\S]*?\]\);\n",
        headings_block + "\n\n",
        data_text,
        count=1,
    )
    data_text = re.sub(
        r"export const EARLY_SYMPTOMS_WORD_BLOCKS = /\*\* @type \{const\} \*/ \(\[[\s\S]*?\]\);\n",
        word_blocks + "\n\n",
        data_text,
        count=1,
    )
    DATA_JS.write_text(data_text, encoding="utf-8")

    # past.js: уникальные подписи (как в чекбоксе) -> past, первая буква строчная
    ordered: list[str] = []
    seen: set[str] = set()
    for r in rows:
        lab = r["label"]
        if lab in seen:
            continue
        seen.add(lab)
        ordered.append(lab)

    past_lines = [
        "/**",
        " * Синхронизация с reference/MentalHelp_early_symptoms_checkbox_to_word.docx",
        " * (scripts/sync_early_symptoms_from_docx.py). Фразы для Word.",
        " */",
        "export const EARLY_SYMPTOM_PAST_BY_LABEL = {",
    ]
    label_to_past = {r["label"]: r["past"] for r in reversed(rows)}
    for lab in ordered:
        p = label_to_past.get(lab, lab)
        if p and p[0].isupper():
            p = p[0].lower() + p[1:]
        key = json.dumps(lab, ensure_ascii=False)
        val = json.dumps(p, ensure_ascii=False)
        past_lines.append(f"  {key}: {val},")
    past_lines.append("};")
    past_lines.append("")
    PAST_JS.write_text("\n".join(past_lines), encoding="utf-8")

    print("Updated", DATA_JS, "and", PAST_JS)
    print("Unique checkbox labels:", len(ordered))


if __name__ == "__main__":
    main()
