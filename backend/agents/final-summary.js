import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { claimsDB } from "../db/in-memory-store.js";

const llm = new ChatOllama({ model: "llama3", temperature: 0 });

export async function generateFinalSummary(claimId) {
  const claim = claimsDB.get(claimId);

  const prompt = `
Create a final insurance claim summary.

Risk:
${JSON.stringify(claim.risk)}

Evidence:
${JSON.stringify(claim.evidence)}

Return JSON:
{
  "decision": "LIKELY_GENUINE | NEEDS_REVIEW | HIGH_RISK",
  "confidence": 0-1,
  "summary": "",
  "nextSteps": []
}
`;

  const response = await llm.invoke(prompt);
  claim.finalDecision = JSON.parse(response.content);
  claim.status = "COMPLETED";

  claimsDB.set(claimId, claim);
}
