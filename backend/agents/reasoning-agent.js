import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { claimsDB } from "../db/in-memory-store.js";

const llm = new ChatOllama({ model: "llama3", temperature: 0 });

export async function reasonOverEvidence(claimId) {
  const claim = claimsDB.get(claimId);

  const prompt = `
Check for inconsistencies or suspicious patterns.

Evidence:
${JSON.stringify(claim.evidence, null, 2)}
`;

  const res = await llm.invoke(prompt);
  claim.anomalies = res.content;

  claimsDB.set(claimId, claim);
}
