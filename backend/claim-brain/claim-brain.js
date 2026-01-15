import { ChatOllama } from "@langchain/community/chat_models/ollama";

const llm = new ChatOllama({
  model: "mistral",
  temperature: 0
});

export async function runClaimBrain(claim, availableTools) {
  const prompt = `
You are an insurance claims intelligence agent.

Goals:
1. Identify missing or unverifiable information
2. Decide the next best MCP tool to call
3. Ask the user ONLY if information cannot be verified
4. Assess ASSISTIVE risk (not decisions)

Rules:
- Never approve or reject claims
- Never accuse the user
- Risk must be explainable
- Use tools conservatively

Claim State:
${JSON.stringify(claim, null, 2)}

Available Tools:
${JSON.stringify(availableTools)}

If calling imageAssessment, use:
filename = claim.latestUpload.filename

Return STRICT JSON:

{
  "action": "CALL_TOOL | ASK_USER | FINAL",
  "tool": null | {
    "name": "govt | policy | hospital | pastClaims | imageAssessment",
    "args": {}
  },
  "message": "",
  "risk": null | {
    "level": "LOW | MEDIUM | HIGH",
    "confidence": 0-1,
    "signals": []
  }
}
`;

  const response = await llm.invoke(prompt);
  return JSON.parse(response.content);
}
