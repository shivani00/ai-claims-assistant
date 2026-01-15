import { queryRAG } from "../../rag/query.js";

export async function policyTool(req, res) {
  const { policyId, holder } = req.body;

  const query = `
    policy master
    coverage rules
    exclusions
    ${policyId}
    ${holder}
  `;

  const docs = await queryRAG(query);

  res.json({
    source: "policy-documents",
    retrievedDocs: docs
  });
}
