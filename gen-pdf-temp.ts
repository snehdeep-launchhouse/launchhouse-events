import fs from "fs";
import jsPDF from "jspdf";
import { downloadResultsPdfV2 } from "/dev-server/src/lib/generate-results-pdf-v2.ts";

console.log("save type:", typeof (jsPDF as any).API.save, typeof (jsPDF as any).prototype?.save);
const d = new jsPDF();
console.log("instance save:", typeof d.save);

// patch instance via API
(jsPDF as any).API.save = function () {
  fs.writeFileSync("/tmp/v2-out.pdf", Buffer.from(this.output("arraybuffer")));
  console.log("saved!");
};

const trace: any = {
  result: { complexity: "Simple", price: "$899", firstDraft: "2 business days", revisionTurnaround: "1 business day" },
  hasEventApp: false, selectedProductsForScope: ["Registration & Event Website"],
  confidenceLevel: "high",
  publicScopingReasons: [], manualReviewReasons: [], categorySignals: {},
};
downloadResultsPdfV2({ trace, scopeBullets: ["Test"], confidenceReasons: ["x"], publicScopingReasons: [] });
console.log("done");
