// CSV export for RSVP lists. Spreadsheet apps run cells that start with
// = + - @ (or a tab/return) as formulas, so those are prefixed with a quote;
// a guest's message must never become a formula on the couple's computer.

const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string | number | boolean | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Rows to CSV text with CRLF line ends and a BOM, so Excel reads UTF-8 names. */
export function toCsv(rows: (string | number | boolean | null | undefined)[][]): string {
  return "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
