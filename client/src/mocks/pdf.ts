/**
 * Minimal PDF writer for demo mode.
 *
 * The real export is server-side (QuestPDF, `API/Services/PdfExportService.cs`),
 * which obviously can't run in a static deploy. Rather than ship a pre-rendered
 * file that goes stale the moment someone adds a check-in, this builds a small
 * multi-page PDF from the live store so the download reflects what's on screen.
 *
 * Deliberately barebones: Helvetica, plain text rows, no graphics. It only has
 * to be a valid, readable document — not a match for the QuestPDF layout.
 */

import type { DemoDb } from "./seed";

const PAGE_WIDTH = 595; // A4 at 72dpi
const PAGE_HEIGHT = 842;
const MARGIN_X = 50;
const TOP_Y = 790;
const BOTTOM_Y = 60;
const LEADING = 14;
const LINES_PER_PAGE = Math.floor((TOP_Y - BOTTOM_Y) / LEADING);

type Line = { text: string; size: number };

const text = (s: string, size = 10): Line => ({ text: s, size });

/**
 * PDF string literals escape backslash and both parens. Non-ASCII is stripped
 * so string length equals byte length — the xref offsets depend on that.
 */
function escapeText(s: string): string {
   return s
      .replace(/[^\x20-\x7e]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
}

const pad = (s: string, width: number) => (s + " ".repeat(width)).slice(0, width);

function buildLines(db: DemoDb): Line[] {
   const lines: Line[] = [];
   const checkIns = [...db.checkIns].sort((a, b) => b.date.localeCompare(a.date));

   lines.push(text("Willow - Symptom Report", 18));
   lines.push(text(`Generated ${new Date().toISOString().split("T")[0]} (demo data)`, 9));
   lines.push(text(""));
   lines.push(text(`Patient: ${db.user.username}`, 10));
   lines.push(text(`Entries: ${checkIns.length}`, 10));

   if (checkIns.length > 0) {
      const avg = (key: "mood" | "pain" | "fatigue" | "nausea") =>
         (checkIns.reduce((sum, c) => sum + c[key], 0) / checkIns.length).toFixed(1);

      lines.push(text(`Range: ${checkIns[checkIns.length - 1].date} to ${checkIns[0].date}`, 10));
      lines.push(text(""));
      lines.push(text("All-time averages", 12));
      lines.push(
         text(
            `Mood ${avg("mood")}   Pain ${avg("pain")}   Fatigue ${avg("fatigue")}   Nausea ${avg("nausea")}`,
         ),
      );

      const weights = checkIns.filter((c) => c.weight != null);
      if (weights.length > 0) {
         const avgWeight =
            weights.reduce((sum, c) => sum + (c.weight ?? 0), 0) / weights.length;
         lines.push(text(`Average weight ${avgWeight.toFixed(1)} kg`));
      }
   }

   lines.push(text(""));
   lines.push(text("Check-ins", 12));
   lines.push(
      text(
         `${pad("Date", 12)}${pad("Mood", 6)}${pad("Pain", 6)}${pad("Fatig", 7)}${pad("Naus", 6)}${pad("Weight", 8)}`,
         9,
      ),
   );

   for (const c of checkIns) {
      lines.push(
         text(
            `${pad(c.date, 12)}${pad(String(c.mood), 6)}${pad(String(c.pain), 6)}` +
               `${pad(String(c.fatigue), 7)}${pad(String(c.nausea), 6)}` +
               `${pad(c.weight != null ? `${c.weight} kg` : "-", 8)}`,
            9,
         ),
      );
      if (c.notes) lines.push(text(`   ${c.notes}`, 8));
   }

   const pending = db.questions.filter((q) => !q.isAsked);
   if (pending.length > 0) {
      lines.push(text(""));
      lines.push(text("Questions for the care team", 12));
      for (const q of pending) lines.push(text(`- ${q.text}`, 9));
   }

   return lines;
}

/** Renders one page's worth of lines into a PDF content stream. */
function buildContentStream(lines: Line[]): string {
   const parts = ["BT", `1 0 0 1 ${MARGIN_X} ${TOP_Y} Tm`];

   lines.forEach((line, i) => {
      parts.push(`/F1 ${line.size} Tf`);
      // First line sits at the text-matrix origin; every later line steps down.
      if (i > 0) parts.push(`0 -${LEADING} Td`);
      if (line.text) parts.push(`(${escapeText(line.text)}) Tj`);
   });

   parts.push("ET");
   return parts.join("\n");
}

function chunk<T>(items: T[], size: number): T[][] {
   const out: T[][] = [];
   for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
   return out.length > 0 ? out : [[]];
}

export function buildDemoPdf(db: DemoDb): Blob {
   const pages = chunk(buildLines(db), LINES_PER_PAGE);

   // Object numbering: 1 = catalog, 2 = pages tree, 3 = font,
   // then per page a page object followed by its content stream.
   const FIRST_PAGE_OBJ = 4;
   const pageObjNums = pages.map((_, i) => FIRST_PAGE_OBJ + i * 2);

   const objects: string[] = [];
   objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
   objects[2] =
      `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] ` +
      `/Count ${pages.length} >>`;
   objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;

   pages.forEach((pageLines, i) => {
      const pageNum = pageObjNums[i];
      const contentNum = pageNum + 1;
      const stream = buildContentStream(pageLines);

      objects[pageNum] =
         `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
         `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNum} 0 R >>`;
      objects[contentNum] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
   });

   // Assemble, recording the byte offset of each object for the xref table.
   let pdf = "%PDF-1.4\n";
   const offsets: number[] = [];

   for (let i = 1; i < objects.length; i++) {
      offsets[i] = pdf.length;
      pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
   }

   const xrefOffset = pdf.length;
   const total = objects.length; // objects.length - 1 real objects, plus the free entry

   pdf += `xref\n0 ${total}\n`;
   pdf += "0000000000 65535 f \n";
   for (let i = 1; i < objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
   }

   pdf += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

   // latin1 keeps one char = one byte, so the recorded offsets stay correct.
   const bytes = Uint8Array.from(pdf, (ch) => ch.charCodeAt(0) & 0xff);
   return new Blob([bytes], { type: "application/pdf" });
}
