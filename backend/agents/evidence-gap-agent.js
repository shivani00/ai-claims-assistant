export function analyzeEvidenceGaps(claim) {
  const required = ["govt", "policy", "hospital", "imageAssessment"];

  const present = [];
  const missing = [];

  for (const key of required) {
    if (claim.context[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  return {
    presentEvidence: present,
    missingEvidence: missing
  };
}
