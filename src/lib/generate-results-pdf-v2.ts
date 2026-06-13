import jsPDF from "jspdf";
import type { ScoringTrace } from "@/lib/calculator-v2/types";
import { EVENT_APP_PRICE } from "@/lib/calculator-v2/pricing";
import { describeConfidence } from "@/lib/calculator-v2/scope-summary";

interface PdfDataV2 {
  trace: ScoringTrace;
  scopeBullets: string[];
  confidenceReasons: string[];
  publicScopingReasons: string[];
}

// Brand colours
const BRAND_PRIMARY = "#006AE1";
const BRAND_DARK = "#141D2B";
const TEXT_MUTED = "#64748B";
const TEXT_DEFAULT = "#1E293B";
const BG_LIGHT = "#F0F5FF";
const WHITE = "#FFFFFF";
const LINE_COLOR = "#CBD5E1";

function parsePrice(s: string): number {
  return parseInt(s.replace(/[^\d]/g, ""), 10) || 0;
}

export function downloadResultsPdfV2({
  trace,
  scopeBullets,
  confidenceReasons,
  publicScopingReasons,
}: PdfDataV2) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getHeight
    ? doc.internal.pageSize.getWidth()
    : 210;
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  const FOOTER_HEIGHT = 24; // mm reserved at bottom for branded footer
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - FOOTER_HEIGHT) {
      doc.addPage();
      y = margin;
    }
  };

  const drawFooter = () => {
    const fy = pageH - FOOTER_HEIGHT + 4; // top of footer area
    // separator line
    doc.setDrawColor(LINE_COLOR);
    doc.setLineWidth(0.25);
    doc.line(margin, fy, pageW - margin, fy);

    // LH logo mark (vector)
    const tile = 10;
    const tx = margin;
    const ty = fy + 4;
    doc.setFillColor(BRAND_PRIMARY);
    doc.roundedRect(tx, ty, tile, tile, 1.8, 1.8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(WHITE);
    doc.text("LH", tx + tile / 2, ty + tile / 2 + 1.4, { align: "center" });

    // Text block to right of logo
    const textX = tx + tile + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(BRAND_DARK);
    doc.text("www.launchhouse.events", textX, ty + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED);
    doc.text("US +1 (571) 444-8523  |  India +91 9999 063 734", textX, ty + 9);
    doc.text("GST # 29AIKPC3628E1ZE  |  Exporter of Service # AIKPC3628E", textX, ty + 14);
  };

  const drawCard = (
    startY: number,
    height: number,
    accentBorder = false,
  ) => {
    doc.setFillColor(WHITE);
    doc.roundedRect(margin, startY, contentW, height, 3, 3, "F");
    doc.setDrawColor(accentBorder ? BRAND_PRIMARY : LINE_COLOR);
    doc.setLineWidth(accentBorder ? 0.5 : 0.25);
    doc.roundedRect(margin, startY, contentW, height, 3, 3, "S");
  };

  const wrap = (text: string, width: number, fontSize: number): string[] => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, width) as string[];
  };

  // ── Header ─────────────────────────────────────────────────
  doc.setFillColor(BRAND_PRIMARY);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(WHITE);
  doc.text("Event Complexity Analysis", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(WHITE);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    margin,
    28,
  );

  y = 50;

  const { result } = trace;

  // ── Tier card ──────────────────────────────────────────────
  const tierH = 56;
  ensureSpace(tierH + 8);
  drawCard(y, tierH);

  const cx = margin + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(BRAND_DARK);
  doc.text(`${result.complexity} Event Build`, cx, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED);
  doc.text("Based on your answers", cx, y + 19);

  const metrics = [
    { label: "Starting Price", value: result.price },
    { label: "First Draft", value: result.firstDraft },
    { label: "Revisions", value: result.revisionTurnaround },
  ];
  const colW = contentW / 3;
  metrics.forEach((m, i) => {
    const mx = margin + colW * i + 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED);
    doc.text(m.label, mx, y + 34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(TEXT_DEFAULT);
    doc.text(m.value, mx, y + 42);
  });

  y += tierH + 8;

  // ── Scope summary card ─────────────────────────────────────
  if (scopeBullets.length > 0) {
    const lineH = 5.5;
    const wrapped: string[][] = scopeBullets.map((b) =>
      wrap(`-  ${b}`, contentW - 16, 9),
    );
    const totalLines = wrapped.reduce((acc, arr) => acc + arr.length, 0);
    const h = 18 + totalLines * lineH + 4;
    ensureSpace(h + 8);
    drawCard(y, h);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND_DARK);
    doc.text("Event Build Scope", margin + 6, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_DEFAULT);
    let by = y + 20;
    wrapped.forEach((lines) => {
      lines.forEach((ln) => {
        doc.text(ln, margin + 8, by);
        by += lineH;
      });
    });

    y += h + 8;
  }

  // ── Selected services card ─────────────────────────────────
  if (trace.selectedProductsForScope.length > 0) {
    const lineH = 5.5;
    const h = 18 + trace.selectedProductsForScope.length * lineH + 4;
    ensureSpace(h + 8);
    drawCard(y, h);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND_DARK);
    doc.text("Selected Services", margin + 6, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_DEFAULT);
    trace.selectedProductsForScope.forEach((p, i) => {
      doc.text(`-  ${p}`, margin + 8, y + 20 + i * lineH);
    });

    y += h + 8;
  }

  // ── Event App add-on card ──────────────────────────────────
  if (trace.eventAppSelected) {
    const hasFeatures = trace.eventAppFeatures.length > 0;
    const lineH = 5.5;
    const h = hasFeatures ? 26 + trace.eventAppFeatures.length * lineH + 4 : 28;
    ensureSpace(h + 8);
    drawCard(y, h, true);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(BRAND_DARK);
    doc.text("Event App add-on", margin + 6, y + 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_PRIMARY);
    doc.text(EVENT_APP_PRICE, margin + contentW - 6, y + 12, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED);
    doc.text("Optional add-on — does not affect your build tier.", margin + 6, y + 19);

    if (hasFeatures) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(TEXT_DEFAULT);
      doc.text("Selected Features:", margin + 6, y + 26);
      doc.setFont("helvetica", "normal");
      trace.eventAppFeatures.forEach((f, i) => {
        doc.text(`-  ${f}`, margin + 8, y + 32 + i * lineH);
      });
    }

    y += h + 8;
  }

  // ── Confidence card ────────────────────────────────────────
  {
    const confidence = describeConfidence(trace.confidenceLevel);
    const bodyLines = wrap(confidence.body, contentW - 12, 9);
    const reasonLines: string[] = [];
    confidenceReasons.forEach((r) => {
      wrap(`-  ${r}`, contentW - 16, 9).forEach((ln) => reasonLines.push(ln));
    });
    const lineH = 5.5;
    const h =
      18 +
      bodyLines.length * lineH +
      (reasonLines.length > 0 ? 4 + reasonLines.length * lineH : 0) +
      6;
    ensureSpace(h + 8);
    drawCard(y, h);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND_DARK);
    doc.text(`Confidence: ${confidence.title}`, margin + 6, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_DEFAULT);
    let cy = y + 20;
    bodyLines.forEach((ln) => {
      doc.text(ln, margin + 6, cy);
      cy += lineH;
    });
    if (reasonLines.length > 0) {
      cy += 2;
      reasonLines.forEach((ln) => {
        doc.text(ln, margin + 8, cy);
        cy += lineH;
      });
    }

    y += h + 8;
  }

  // ── Scoping recommendation card (conditional) ──────────────
  if (trace.manualReviewRequired && publicScopingReasons.length > 0) {
    const intro = "A short scoping conversation will help confirm pricing and timeline:";
    const introLines = wrap(intro, contentW - 12, 9);
    const reasonLines: string[] = [];
    publicScopingReasons.forEach((r) => {
      wrap(`-  ${r}`, contentW - 16, 9).forEach((ln) => reasonLines.push(ln));
    });
    const lineH = 5.5;
    const h = 18 + introLines.length * lineH + 4 + reasonLines.length * lineH + 6;
    ensureSpace(h + 8);
    drawCard(y, h, true);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND_DARK);
    doc.text("Scoping call recommended", margin + 6, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_DEFAULT);
    let sy = y + 20;
    introLines.forEach((ln) => {
      doc.text(ln, margin + 6, sy);
      sy += lineH;
    });
    sy += 2;
    reasonLines.forEach((ln) => {
      doc.text(ln, margin + 8, sy);
      sy += lineH;
    });

    y += h + 8;
  }

  // ── Investment summary ─────────────────────────────────────
  const buildPrice = parsePrice(result.price);
  const appPrice = trace.eventAppSelected ? parsePrice(EVENT_APP_PRICE) : 0;
  const total = buildPrice + appPrice;
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  const invH = trace.eventAppSelected ? 52 : 40;
  ensureSpace(invH + 8);
  drawCard(y, invH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(BRAND_DARK);
  doc.text("Estimated Starting Investment", margin + 6, y + 12);

  let iy = y + 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(TEXT_MUTED);
  doc.text("Event Build", margin + 6, iy);
  doc.setTextColor(TEXT_DEFAULT);
  doc.text(`Starting from ${result.price}`, margin + contentW - 6, iy, {
    align: "right",
  });

  if (trace.eventAppSelected) {
    iy += 8;
    doc.setTextColor(TEXT_MUTED);
    doc.text("Event App add-on", margin + 6, iy);
    doc.setTextColor(TEXT_DEFAULT);
    doc.text(`Starting from ${EVENT_APP_PRICE}`, margin + contentW - 6, iy, {
      align: "right",
    });
  }

  iy += 6;
  doc.setDrawColor(LINE_COLOR);
  doc.setLineWidth(0.25);
  doc.line(margin + 6, iy, margin + contentW - 6, iy);

  iy += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_DARK);
  doc.text("Estimated Total", margin + 6, iy);
  doc.setTextColor(BRAND_PRIMARY);
  doc.text(fmt(total), margin + contentW - 6, iy, { align: "right" });

  y += invH + 12;

  // ── Footer CTA ─────────────────────────────────────────────
  ensureSpace(40);
  doc.setFillColor(BG_LIGHT);
  doc.roundedRect(margin, y, contentW, 26, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND_DARK);
  doc.text("Ready to get started?", margin + 6, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED);
  doc.text(
    "Visit launchhouse.events or email sam@launchhouse.events",
    margin + 6,
    y + 18,
  );

  // ── Draw branded footer on every page ──────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter();
  }

  doc.save("Event-Complexity-Analysis.pdf");
}
