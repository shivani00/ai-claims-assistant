import { ChatOllama } from "@langchain/community/chat_models/ollama";

const llm = new ChatOllama({ model: "mistral", temperature: 0 });

export async function imageClassifierTool(req, res) {
  const { filename } = req.body;

  const prompt = `
You are an insurance image triage assistant.

Image file: ${filename}

Return JSON:
{
  "claimType": "MOTOR | HEALTH | PROPERTY",
  "damageType": "",
  "severity": "LOW | MEDIUM | HIGH",
  "confidence": 0-1
}
`;

  const response = await llm.invoke(prompt);
  res.json(JSON.parse(response.content));
}
