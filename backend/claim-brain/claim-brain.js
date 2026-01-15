import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "AIzaSyC5SNWOy8iE2kvrjwbNl0dI0xCU54De_yw"; // ⚠️ DEMO ONLY

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

export async function runClaimBrain(claim, availableTools) {
  const prompt = `
You are an insurance claims intelligence agent.

STRICT RULES:
- NEVER approve or reject claims
- NEVER accuse the user
- Risk is assistive only
- Return ONLY valid JSON
- No text outside JSON

Responsibilities:
1. Identify missing information
2. Decide which MCP tool to call next
3. Ask user ONLY if required
4. Provide risk signals
5. Generate final claim summary

Claim State:
${JSON.stringify(claim, null, 2)}

Available Tools:
${JSON.stringify(availableTools)}

Return JSON in this exact format:

{
  "action": "CALL_TOOL | ASK_USER | FINAL",
  "tool": null | {
    "name": "govt | policy | hospital | pastClaims | imageAssessment",
    "args": {}
  },
  "message": "",
  "summary": "",
  "risk": null | {
    "level": "LOW | MEDIUM | HIGH",
    "confidence": 0-1,
    "signals": []
  }
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Gemini returned invalid JSON:\n" + text);
  }

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}
