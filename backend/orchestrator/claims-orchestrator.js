import { discoverEvidence } from "../agents/discover-evidence.js";
import { assessEvidence } from "../agents/evidence-assessment-agent.js";
import { reasonOverEvidence } from "../agents/reasoning-agent.js";
import { scoreRisk } from "../agents/risk-agent.js";
import { generateFinalSummary } from "../agents/final-summary.js";
import { claimsDB } from "../db/in-memory-store.js";

export async function orchestrate(claimId) {
  const claim = claimsDB.get(claimId);

  // 1️⃣ Fetch evidence ONCE
  if (!claim.evidenceFetched) {
    await discoverEvidence(claimId);
  }

  // 2️⃣ Assess evidence
  if (!claim.assessment) {
    await assessEvidence(claimId);
    return {
      type: "CONFIRM",
      summary: claim.assessment.foundSummary,
      questions: claim.assessment.confirmQuestions
    };
  }

  // 3️⃣ Ask missing info
  if (claim.assessment.missingQuestions.length > 0) {
    return {
      type: "QUESTION",
      questions: claim.assessment.missingQuestions,
      documents: claim.assessment.requiredDocuments
    };
  }

  // 4️⃣ Reasoning
  if (!claim.anomalies) {
    await reasonOverEvidence(claimId);
    return { type: "STATUS", message: "Analyzing inconsistencies..." };
  }

  // 5️⃣ Risk
  if (!claim.risk) {
    await scoreRisk(claimId);
    return { type: "STATUS", message: "Calculating risk score..." };
  }

  // 6️⃣ Final
  if (!claim.finalDecision) {
    await generateFinalSummary(claimId);
  }

  return { type: "SUMMARY", data: claim.finalDecision };
}
