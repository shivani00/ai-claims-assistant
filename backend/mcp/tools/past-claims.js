import { queryRAG } from "../../rag/query.js";

export async function pastClaimsTool(req, res) {
  const { person, vehicle } = req.body;

  const query = `
    past claims history
    rejected claims
    duplicate claim
    ${person}
    ${vehicle}
  `;

  const docs = await queryRAG(query);

  res.json({
    source: "past-claims",
    retrievedDocs: docs   // ← includes metadata now
  });
}
