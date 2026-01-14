import express from "express";
import bodyParser from "body-parser";
import { govtDataTool } from "./tools/govt-data-tool.js";
import { policyTool } from "./tools/policy-tool.js";

const app = express();
app.use(bodyParser.json());

app.post("/mcp/tools/govt-data", govtDataTool);
app.post("/mcp/tools/policy", policyTool);

app.listen(4000, () =>
  console.log("🧠 MCP Server running on port 4000")
);
