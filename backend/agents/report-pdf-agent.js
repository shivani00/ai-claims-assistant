import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const PDF_DIR = "reports/pdf";
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

export function generateReportPDF(claim, gaps, analysis) {
  const filePath = path.join(
    PDF_DIR,
    `claim-report-${claim.claimId}.pdf`
  );

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ---------- TITLE ----------
  doc
    .fontSize(20)
    .text("Claim Intelligence Report", { align: "center" })
    .moveDown(2);

  // ---------- CLAIM INFO ----------
  doc.fontSize(12).text(`Claim ID: ${claim.claimId}`);
  doc.text(`User ID: ${claim.userId}`);
  doc.text(`Status: ${claim.status}`);
  doc.moveDown();

  // ---------- EVIDENCE ----------
  doc.fontSize(14).text("Evidence Summary", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12).text(`Present Evidence:`);
  gaps.presentEvidence.forEach(e =>
    doc.text(`• ${e}`)
  );

  doc.moveDown(0.5);
  doc.text(`Missing Evidence:`);
  gaps.missingEvidence.forEach(e =>
    doc.text(`• ${e}`)
  );

  doc.moveDown();

  // ---------- RISK ----------
  doc.fontSize(14).text("Risk Assessment", { underline: true });
  doc.moveDown(0.5);

  if (analysis?.risk) {
    doc.text(`Risk Level: ${analysis.risk.level}`);
    doc.text(`Confidence: ${analysis.risk.confidence}`);
    doc.text("Signals:");
    analysis.risk.signals.forEach(s =>
      doc.text(`• ${s}`)
    );
  } else {
    doc.text("Risk assessment unavailable");
  }

  doc.moveDown();

  // ---------- SUMMARY ----------
  doc.fontSize(14).text("Executive Summary", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(analysis?.summary || "Summary not available");

  // ---------- FOOTER ----------
  doc.moveDown(2);
  doc
    .fontSize(10)
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      { align: "right" }
    );

  doc.end();

  return filePath;
}
