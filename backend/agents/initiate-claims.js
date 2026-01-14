import crypto from "crypto";
import { claimsDB } from "../db/in-memory-store.js";

export function initiateClaim(userId, message) {
  const claimId = crypto.randomUUID();

  const claim = {
    claimId,
    userId,
    messages: [{ role: "user", content: message }],

    // 🔑 STATE FLAGS
    evidence: [],
    evidenceFetched: false,
    assessment: null,
    anomalies: null,
    risk: null,
    finalDecision: null,

    status: "IN_PROGRESS"
  };

  claimsDB.set(claimId, claim);
  return claim;
}
