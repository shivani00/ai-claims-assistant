import { createClaim, claimsDB } from "../db/claim-store.js";

export function initiateClaim({ userId, message }) {
  const claim = createClaim({ userId, message });
  claimsDB.set(claim.claimId, claim);
  return claim;
}
