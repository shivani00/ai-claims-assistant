import fetch from "node-fetch";
import { claimsDB } from "../db/in-memory-store.js";

export async function discoverEvidence(claimId) {
  const claim = claimsDB.get(claimId);

  const response = await fetch("http://localhost:4000/mcp/tools/govt-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: claim.messages.map(m => m.content).join(" ")
    })
  });

  const data = await response.json();

  claim.evidence.push(data);
  claim.evidenceFetched = true;

  claimsDB.set(claimId, claim);
}
