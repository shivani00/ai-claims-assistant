import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC5SNWOy8iE2kvrjwbNl0dI0xCU54De_yw"
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function assessRisk(claim, gaps) {
  const prompt = `
You are an insurance risk intelligence agent.

Analyze this claim and assign ASSISTIVE risk.
Do NOT approve or reject claims.

Evidence Present:
${JSON.stringify(gaps.present)}

Evidence Missing:
${JSON.stringify(gaps.missing)}

Context:
${JSON.stringify(claim.context, null, 2)}

Return JSON ONLY:
{
  "summary": "",
  "risk": {
    "level": "LOW | MEDIUM | HIGH",
    "confidence": 0-1,
    "signals": []
  }
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return JSON.parse(text.slice(start, end + 1));
}
