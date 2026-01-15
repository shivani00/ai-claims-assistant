import fs from "fs";
import path from "path";

const DIR = "reports";
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR);

export function generateReport(claim, gaps, analysis) {
  const report = {
    claimId: claim.claimId,
    userId: claim.userId,
    evidence: gaps,
    risk: analysis.risk,
    summary: analysis.summary,
    generatedAt: new Date().toISOString()
  };

  const filePath = path.join(DIR, `claim-${claim.claimId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

  return filePath;
}
