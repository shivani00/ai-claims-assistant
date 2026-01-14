import { queryGovtData } from "../../rag/query.js";

export async function govtDataTool(req, res) {
  const { query } = req.body;

  const evidence = await queryGovtData(query);

  res.json({
    source: "government-records",
    evidence
  });
}
