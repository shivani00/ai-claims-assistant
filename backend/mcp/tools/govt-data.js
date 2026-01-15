import { queryRAG } from "../../rag/query.js";

export async function govtTool(req, res) {
  const { person, incident } = req.body;

  const query = `
    FIR report
    vehicle registry
    driving license
    ${person}
    ${incident}
  `;

  const docs = await queryRAG(query);

  res.json({
    source: "govt-records",
    retrievedDocs: docs
  });
}
