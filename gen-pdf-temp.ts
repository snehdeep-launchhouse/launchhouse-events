import jsPDF from "jspdf";
const origSave = (jsPDF as any).prototype.save;
(jsPDF as any).prototype.save = function (name: string) {
  const fs = require("fs");
  fs.writeFileSync("/tmp/v2-out.pdf", Buffer.from(this.output("arraybuffer")));
  console.log("saved", name);
};
const { downloadResultsPdfV2 } = await import("/dev-server/src/lib/generate-results-pdf-v2.ts");
const trace: any = {
  result: { complexity: "Simple", price: "$899", firstDraft: "2 business days", revisionTurnaround: "1 business day" },
  hasEventApp: false, selectedProductsForScope: ["Registration & Event Website"],
  confidenceLevel: "high",
  publicScopingReasons: [], manualReviewReasons: [], categorySignals: {},
};
downloadResultsPdfV2({ trace, scopeBullets: ["Test scope bullet"], confidenceReasons: ["High confidence"], publicScopingReasons: [] });
