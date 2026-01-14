import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { claimsDB } from "../db/in-memory-store.js";

const llm = new ChatOllama({ model: "llama3", temperature: 0 });

export async function scoreRisk(claimId) {
  const claim = claimsDB.get(claimId);

  const prompt = `
Evaluate risk for this insurance claim.

Evidence:
${JSON.stringify(claim.evidence, null, 2)}

Inconsistencies:
${JSON.stringify(claim.reasoning.inconsistencies)}

Return JSON:
{
  "riskScore": 0-100,
  "riskLevel": "LOW | MEDIUM | HIGH",
  "reasons": []
}
`;

  const response = await llm.invoke(prompt);
  claim.risk = JSON.parse(response.content);

  claimsDB.set(claimId, claim);
}
