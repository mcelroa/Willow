import { describe, expect, it } from "vitest";
import { buildDemoPdf } from "../pdf";
import { buildSeedDb } from "../seed";

/**
 * The xref table stores a byte offset for every object. If those drift the file
 * still *looks* fine as text but readers reject it, so the offsets are checked
 * against the actual bytes rather than just eyeballing the structure.
 */
async function renderPdf() {
   const blob = buildDemoPdf(buildSeedDb());
   // Every byte is ASCII by construction, so a UTF-8 decode is byte-accurate.
   return { blob, raw: await blob.text() };
}

describe("buildDemoPdf", () => {
   it("produces a well-formed PDF document", async () => {
      const { blob, raw } = await renderPdf();

      expect(blob.type).toBe("application/pdf");
      expect(raw.startsWith("%PDF-1.4")).toBe(true);
      expect(raw.trimEnd().endsWith("%%EOF")).toBe(true);
   });

   it("contains no bytes above the ASCII range", async () => {
      const { raw } = await renderPdf();
      // Non-ASCII would make string length differ from byte length, silently
      // invalidating every xref offset.
      const offending = [...raw].find((ch) => ch.charCodeAt(0) > 0x7f);
      expect(offending).toBeUndefined();
   });

   it("points startxref at the xref table", async () => {
      const { raw } = await renderPdf();

      const startxref = Number(raw.match(/startxref\n(\d+)/)?.[1]);
      expect(Number.isFinite(startxref)).toBe(true);
      expect(raw.slice(startxref, startxref + 4)).toBe("xref");
   });

   it("records a byte offset that resolves for every object", async () => {
      const { raw } = await renderPdf();

      const xrefStart = Number(raw.match(/startxref\n(\d+)/)?.[1]);
      const table = raw.slice(xrefStart);

      const entries = [...table.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
      expect(entries.length).toBeGreaterThan(0);

      entries.forEach((offset, i) => {
         const objNum = i + 1; // entry 0 is the free-list head, not emitted here
         expect(raw.slice(offset)).toMatch(new RegExp(`^${objNum} 0 obj`));
      });
   });

   it("declares a stream length matching the actual stream bytes", async () => {
      const { raw } = await renderPdf();

      const streams = [...raw.matchAll(/<< \/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/g)];
      expect(streams.length).toBeGreaterThan(0);

      for (const [, declared, body] of streams) {
         expect(body.length).toBe(Number(declared));
      }
   });

   it("paginates long histories instead of overflowing one page", async () => {
      const { raw } = await renderPdf();

      const pageCount = [...raw.matchAll(/\/Type \/Page[^s]/g)].length;
      expect(pageCount).toBeGreaterThan(1);

      const declared = Number(raw.match(/\/Type \/Pages \/Kids \[([^\]]*)\] \/Count (\d+)/)?.[2]);
      expect(declared).toBe(pageCount);
   });

   it("includes seeded check-in data", async () => {
      const { raw } = await renderPdf();

      expect(raw).toContain("Willow - Symptom Report");
      expect(raw).toContain("All-time averages");
      expect(raw).toContain("Questions for the care team");
   });
});
