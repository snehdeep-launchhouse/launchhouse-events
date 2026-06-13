import jsPDF from "jspdf";
(jsPDF as any).prototype.save = function (name: string) {
  const fs = require("fs");
  fs.writeFileSync("/tmp/v2-out.pdf", Buffer.from(this.output("arraybuffer")));
  process.stdout.write("saved " + name + "\n");
};
try {
  const m = await import("/dev-server/src/lib/generate-results-pdf-v2.ts");
  const trace: any = {
    result: { complexity: "Simple", price: "$899", firstDraft: "2 business days", revisionTurnaround: "1 business day" },
    hasEventApp: false, selectedProductsForScope: ["Registration & Event Website"],
    confidenceLevel: "high",
    publicScopingReasons: [], manualReviewReasons: [], categorySignals: {},
  };
  m.downloadResultsPdfV2({ trace, scopeBullets: ["Test"], confidenceReasons: ["x"], publicScopingReasons: [] });
  process.stdout.write("done\n");
} catch (e) {
  process.stdout.write("ERR: " + (e as Error).message + "\n" + (e as Error).stack + "\n");
}
