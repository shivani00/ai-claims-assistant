import crypto from "crypto";

export const claimsDB = new Map();

export function createClaim({ userId, message }) {
  return {
    claimId: crypto.randomUUID(),
    userId,

    conversation: [
      { role: "user", content: message }
    ],

    context: {
      govt: null,
      policy: null,
      hospital: null,
      pastClaims: null,
      imageAssessment: null
    },

    uploads: [],
    latestUpload: null,

    pendingQuestion: null,
    risk: null,

    status: "ACTIVE"
  };
}
