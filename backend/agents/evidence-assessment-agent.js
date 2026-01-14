import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { claimsDB } from "../db/in-memory-store.js";

const llm = new ChatOllama({ model: "llama3", temperature: 0 });

export async function assessEvidence(claimId) {
  const claim = claimsDB.get(claimId);

  const prompt = `
You are an insurance claims investigator.

Conversation so far:
${claim.messages.map(m => `${m.role}: ${m.content}`).join("\n")}

Evidence retrieved from government and hospital records:
${JSON.stringify(claim.evidence, null, 2)}

Tasks:
1. Summarize what information was found.
2. Decide what must be confirmed by the user.
3. Identify missing or weak evidence.
4. Generate questions to ask the user.
5. Specify documents to upload if required.

Return STRICT JSON:
{
  "foundSummary": "",
  "confirmWithUser": true/false,
  "confirmationQuestions": [],
  "missingInfoQuestions": [],
  "requiredDocuments": [],
  "confidenceLevel": "HIGH | MEDIUM | LOW"
}
`;

  const response = await llm.invoke(prompt);
  claim.evidenceAssessment = JSON.parse(response.content);

  claimsDB.set(claimId, claim);
  return claim.evidenceAssessment;
}
