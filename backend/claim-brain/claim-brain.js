import { ChatOllama } from "@langchain/community/chat_models/ollama";

const llm = new ChatOllama({
  model: "mistral",
  temperature: 0
});

export async function runClaimBrain(claim, availableTools) {
  const prompt = `
You are an insurance claims copilot.

Your responsibilities:
1. Decide what information is missing
2. Decide which MCP tool to call next
3. Ask the user only if needed
4. Assess CLAIM RISK based on:
   - User statements
   - Retrieved documents
   - Known fraud patterns
5. Provide an EXPLAINABLE risk assessment

IMPORTANT RULES:
- DO NOT approve or reject claims
- DO NOT accuse the user
- Risk is ASSISTIVE only
- Be factual and neutral

Claim State:
${JSON.stringify(claim, null, 2)}

Available MCP tools:
${JSON.stringify(availableTools, null, 2)}

Return STRICT JSON only in this format:

{
  "action": "CALL_TOOL | ASK_USER | FINAL",
  "tool": null | {
    "name": "",
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
