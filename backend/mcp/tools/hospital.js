import { queryRAG } from "../../rag/query.js";

export async function hospitalTool(req, res) {
  const { patient, date } = req.body;

  const query = `
    hospital admission
    discharge summary
    medical bill
    ${patient}
    ${date}
  `;

  const docs = await queryRAG(query);

  res.json({
    source: "hospital-records",
    retrievedDocs: docs
  });
}
