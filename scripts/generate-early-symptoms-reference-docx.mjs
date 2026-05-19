/**
 * Справочный Word-файл: подпись чекбокса → категория в абзаце → фраза в прошедшем времени.
 * Запуск: node scripts/generate-early-symptoms-reference-docx.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import {
  EARLY_SYMPTOMS_WORD_BLOCKS,
  formatEarlySymptomsForWord,
  getEarlySymptomsGroups,
} from "../src/mental-help-disease-early-symptoms-data.js";
import { EARLY_SYMPTOM_PAST_BY_LABEL } from "../src/mental-help-disease-early-symptoms-past.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../reference/MentalHelp_early_symptoms_checkbox_to_word.docx");

/** @param {string} t */
function p(t, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text: t, ...opts })],
  });
}

/** @param {string} sectionTitle */
function wordBlockHeaderForSection(sectionTitle) {
  for (const b of EARLY_SYMPTOMS_WORD_BLOCKS) {
    if (b.sections.includes(sectionTitle)) return b.header;
  }
  return "—";
}

/** @param {string} text @param {boolean} bold */
function cellP(text, bold = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold })],
      }),
    ],
  });
}

function main() {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cellP("Раздел в модальном окне (группа)", true),
      cellP("Текст в чекбоксе", true),
      cellP("Заголовок блока в итоговом абзаце Word", true),
      cellP("Фраза в абзаце Word (прошедшее время; в файле с заглавными для читаемости)", true),
    ],
  });

  /** @type {TableRow[]} */
  const dataRows = [];
  for (const g of getEarlySymptomsGroups()) {
    const blockH = wordBlockHeaderForSection(g.title);
    for (const label of g.items) {
      const past =
        EARLY_SYMPTOM_PAST_BY_LABEL[label] ?? label.charAt(0).toLowerCase() + label.slice(1);
      const pastDisplay = past.charAt(0).toUpperCase() + past.slice(1);
      dataRows.push(
        new TableRow({
          children: [
            cellP(g.title, false),
            cellP(label, false),
            cellP(blockH, false),
            cellP(pastDisplay, false),
          ],
        }),
      );
    }
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2800, 3200, 2600, 5200],
    rows: [headerRow, ...dataRows],
  });

  const sampleLabels = [
    "Сниженное настроение",
    "Боязнь одиночества",
    "Ком в горле",
    "Трудно заснуть",
    "Аппетит снижен",
    "Переедаю",
    "Память стала хуже",
    "Мою руки часто",
    "Избегаю людей",
    "Постоянная усталость",
    "Стал чаще выпивать",
  ];
  const sampleLine = formatEarlySymptomsForWord(sampleLabels.join("\n"));

  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "Ранние симптомы (вопрос 3): чекбокс и текст в Word", bold: true })],
    }),
    p(
      "В колонке «Текст в чекбоксе» — ровно то, что видит пациент в форме (подпись до тире в списке). " +
        "В Word в готовом документе весь перечень после двоеточия приводится к строчным буквам; здесь фраза показана с заглавной первой буквы для удобства чтения в таблице.",
    ),
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Полная таблица соответствий", bold: true })],
    }),
    table,
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Пример итоговой строки в Word", bold: true })],
    }),
    p("Выбраны только следующие пункты (через перенос строки в данных):", { italics: true }),
    ...sampleLabels.map((x) => p(`• ${x}`)),
    new Paragraph({ children: [] }),
    p("Итоговый абзац (как в экспорте; регистр как в программе):", { italics: true }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: sampleLine, bold: false })],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const dir = path.dirname(OUT);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return Packer.toBuffer(doc).then((buf) => {
    fs.writeFileSync(OUT, buf);
    console.log("Wrote", OUT, `(${dataRows.length} строк данных)`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
