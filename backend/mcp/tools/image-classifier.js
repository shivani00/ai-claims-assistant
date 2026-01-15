import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

export async function imageClassifierTool(req, res) {
  const { filename } = req.body;

  if (!filename) {
    return res.json({ error: "No image provided" });
  }

  const prompt = `
You are an insurance image triage assistant.

Image metadata file: ${filename}

Return ONLY valid JSON in this format:

{
  "claimType": "MOTOR | HEALTH | PROPERTY",
  "damageType": "",
  "severity": "LOW | MEDIUM | HIGH",
  "confidence": 0-1
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    return res.json({ error: "Invalid AI response", raw: text });
  }

  res.json(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));
}
