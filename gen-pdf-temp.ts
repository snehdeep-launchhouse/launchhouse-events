import jsPDF from "jspdf";
import { downloadResultsPdfV2 } from "/dev-server/src/lib/generate-results-pdf-v2.ts";
import fs from "fs";
(jsPDF as any).prototype.save = function () {
  fs.writeFileSync("/tmp/v2-out.pdf", Buffer.from(this.output("arraybuffer")));
};
const trace: any = {
  result: { complexity: "Simple", price: "$899", firstDraft: "2 business days", revisionTurnaround: "1 business day" },
  hasEventApp: false, eventAppAddon: false,
  selectedProductsForScope: ["Registration & Event Website"],
  selectedServices: ["Registration & Event Website"],
  publicScopingReasons: [], manualReviewReasons: [], categorySignals: {},
  inputs: {}, scoreBreakdown: {}, multipliers: {}, addOns: [],
};
downloadResultsPdfV2({ trace, scopeBullets: ["Test scope bullet"], confidenceReasons: ["High confidence"], publicScopingReasons: [] });
console.log("ok", fs.statSync("/tmp/v2-out.pdf").size);
