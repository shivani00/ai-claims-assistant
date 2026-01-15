import express from "express";
import bodyParser from "body-parser";

import { govtTool } from "./tools/govt-data.js";
import { policyTool } from "./tools/policy.js";
import { hospitalTool } from "./tools/hospital.js";
import { pastClaimsTool } from "./tools/past-claims.js";
import { imageClassifierTool } from "./tools/image-classifier.js";

const app = express();
app.use(bodyParser.json());

app.post("/tools/govt", govtTool);
app.post("/tools/policy", policyTool);
app.post("/tools/hospital", hospitalTool);
app.post("/tools/past-claims", pastClaimsTool);
app.post("/tools/image-classifier", imageClassifierTool);

app.listen(4000, () =>
  console.log("🧠 MCP Server running on port 4000")
);
