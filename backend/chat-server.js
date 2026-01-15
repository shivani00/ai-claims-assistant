import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";

import { createClaim, claimsDB } from "./db/claim-store.js";
import { runClaimBrain } from "./claim-brain/claim-brain.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(bodyParser.json());

const MCP_TOOLS = [
  "govt",
  "policy",
  "hospital",
  "pastClaims",
  "imageAssessment"
];

const MAX_TOOL_CALLS = 5;

async function callMCPTool(tool) {
  const urlMap = {
    govt: "http://localhost:4000/tools/govt",
    policy: "http://localhost:4000/tools/policy",
    hospital: "http://localhost:4000/tools/hospital",
    pastClaims: "http://localhost:4000/tools/past-claims",
    imageAssessment: "http://localhost:4000/tools/image-classifier"
  };

  const response = await fetch(urlMap[tool.name], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tool.args)
  });

  return response.json();
}

app.post("/chat", upload.array("files"), async (req, res) => {
  const { claimId, message, userId } = req.body;

  let claim = claimId ? claimsDB.get(claimId) : null;

  if (!claim) {
    claim = createClaim({ userId, message });
  } else if (message) {
    claim.conversation.push({ role: "user", content: message });
    claim.pendingQuestion = null;
  }

  if (req.files?.length) {
    req.files.forEach(file => {
      claim.uploads.push({
        filename: file.filename,
        originalName: file.originalname,
        type: file.mimetype
      });
    });
    claim.latestUpload = req.files.at(-1);
  }

  let decision;
  let toolCalls = 0;

  while (toolCalls < MAX_TOOL_CALLS) {
    decision = await runClaimBrain(claim, MCP_TOOLS);

    if (decision.action === "CALL_TOOL") {
      toolCalls++;
      const result = await callMCPTool(decision.tool);
      claim.context[decision.tool.name] = result;
      continue;
    }

    if (decision.action === "ASK_USER") {
      claim.status = "AWAITING_USER";
      claim.pendingQuestion = decision.message;
      break;
    }

    break;
  }

  if (decision?.risk) {
    claim.risk = decision.risk;
  }

  claimsDB.set(claim.claimId, claim);

  return res.json({
    claimId: claim.claimId,
    action: decision.action,
    message: decision.message,
    risk: decision.risk
  });
});

app.listen(3000, () => {
  console.log("🤖 Chat server running on port 3000");
});
