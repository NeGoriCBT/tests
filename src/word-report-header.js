/** Общий «шапочный» блок отчёта Word: дата, линия для ФИО, специалист. */

const PATIENT_LINE = "________________________________________________________________";

/**
 * @param {typeof import("docx").Paragraph} Paragraph
 * @param {typeof import("docx").TextRun} TextRun
 * @param {{ dateStr: string; specialistName: string; personnelLabel?: string; patientGenderRu?: string | null }} opts
 */
export function buildWordReportHeader(Paragraph, TextRun, {
  dateStr,
  specialistName,
  personnelLabel = "Специалист",
  patientGenderRu = null,
}) {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: "Дата: ", bold: true }),
        new TextRun(dateStr),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "ФИО пациента: ", bold: true }),
        new TextRun(PATIENT_LINE),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${personnelLabel}: `, bold: true }),
        new TextRun(specialistName),
      ],
    }),
    ...(patientGenderRu
      ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Пол: ", bold: true }),
              new TextRun(patientGenderRu),
            ],
          }),
        ]
      : []),
    new Paragraph({ text: "" }),
  ];
}
