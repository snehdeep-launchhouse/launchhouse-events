import jsPDF from "jspdf";
import type { Result } from "@/lib/calculator-data";

interface PdfData {
  result: Result;
  allProducts: string[];
  attendeeHubSelected: boolean;
  attendeeHubFeatures: string[];
  scopeBullets?: string[];
}

// Brand colours (HSL → hex)
const BRAND_PRIMARY = "#006AE1";
const BRAND_DARK = "#141D2B";
const TEXT_MUTED = "#64748B";
const TEXT_DEFAULT = "#1E293B";
const BG_LIGHT = "#F0F5FF";
const WHITE = "#FFFFFF";
const LINE_COLOR = "#CBD5E1";

export function downloadResultsPdf({
  result,
  allProducts,
  attendeeHubSelected,
  attendeeHubFeatures,
  scopeBullets,
}: PdfData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Header band ────────────────────────────────────────────
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

  // ── Helper: section card ────────────────────────────────────
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

  // ── 1. Complexity result card ──────────────────────────────
  const card1H = 62;
  drawCard(y, card1H);

  const cx = margin + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(BRAND_DARK);
  doc.text(`${result.complexity} Event Build`, cx, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED);
  doc.text("Registration + Website build complexity", cx, y + 19);

  // Metrics row
  const metrics = [
    { label: "Starting Price", value: result.price },
    { label: "First Draft", value: result.firstDraft },
    { label: "Revisions", value: result.revisionTurnaround },
  ];
  const colW = contentW / 3;
  metrics.forEach((m, i) => {
    const mx = margin + colW * i + 6;
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED);
    doc.text(m.label, mx, y + 32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(TEXT_DEFAULT);
    doc.text(m.value, mx, y + 39);
    doc.setFont("helvetica", "normal");
  });

  // Products
  if (allProducts.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_DEFAULT);
    doc.text("Recommended Cvent Products:", cx, y + 50);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_PRIMARY);
    doc.text(allProducts.join("  ·  "), cx, y + 56);
  }

  y += card1H + 8;

  // ── 1b. Scope summary card (conditional) ───────────────────
  if (scopeBullets && scopeBullets.length > 0) {
    const lineH = 6.5;
    const scopeH = 24 + scopeBullets.length * lineH + 4;
    drawCard(y, scopeH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND_DARK);
    doc.text("Event Build Scope", margin + 6, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_DEFAULT);
    scopeBullets.forEach((bullet, i) => {
      doc.text(`-  ${bullet}`, margin + 8, y + 22 + i * lineH);
    });

    y += scopeH + 8;
  }

  // ── 2. Attendee Hub card (conditional) ─────────────────────
  if (attendeeHubSelected) {
    const featuresText =
      attendeeHubFeatures.length > 0
        ? attendeeHubFeatures.join("  ·  ")
        : "";
    const hubH = attendeeHubFeatures.length > 0 ? 48 : 34;
    drawCard(y, hubH, true);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(BRAND_DARK);
    doc.text("📱  Attendee Hub / Event App", margin + 6, y + 12);

    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED);
    doc.text("Optional Event App Module", margin + 6, y + 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_PRIMARY);
    doc.text("$1,999", margin + contentW - 6, y + 12, { align: "right" });

    if (featuresText) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(TEXT_DEFAULT);
      doc.text("Selected Features:", margin + 6, y + 32);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(BRAND_PRIMARY);
      doc.text(featuresText, margin + 6, y + 38);
    }

    y += hubH + 8;
  }

  // ── 3. Investment summary card ─────────────────────────────
  const buildPrice = parseInt(result.price.replace(/[$,]/g, ""), 10);
  const hubPrice = attendeeHubSelected ? 1999 : 0;
  const total = buildPrice + hubPrice;
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const invH = attendeeHubSelected ? 52 : 40;
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

  if (attendeeHubSelected) {
    iy += 8;
    doc.setTextColor(TEXT_MUTED);
    doc.text("Event App Module", margin + 6, iy);
    doc.setTextColor(TEXT_DEFAULT);
    doc.text("Starting from $1,999", margin + contentW - 6, iy, {
      align: "right",
    });
  }

  // Divider
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

  y += invH + 16;

  // ── Footer ─────────────────────────────────────────────────
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

  // ── Watermark ──────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED);
  doc.text(
    "LaunchHouse Events · launchhouse.events",
    pageW / 2,
    pageH - 10,
    { align: "center" },
  );

  // ── Save ───────────────────────────────────────────────────
  doc.save("Event-Complexity-Analysis.pdf");
}
