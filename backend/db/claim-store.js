import crypto from "crypto";

export const claimsDB = new Map();

export function createClaim({ userId, message }) {
  return {
    claimId: crypto.randomUUID(),
    userId,
    message,
    context: {
      govt: null,
      policy: null,
      hospital: null,
      imageAssessment: null
    },
    uploads: [],
    risk: null,
    summary: null,
    reportPath: null,
    status: "PROCESSING"
  };
}
