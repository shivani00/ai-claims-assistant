import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";

import { createClaim, claimsDB } from "./db/claim-store.js";
import { runClaimBrain } from "./claim-brain/claim-brain.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(bodyParser.json());

/**
 * MCP tools available to the Claim Brain
 * (Claim Brain decides WHEN to use them)
 */
const MCP_TOOLS = [
  "govt",
  "policy",
  "hospital",
  "past-claims",
  "image-classifier"
];

/**
 * CHAT ENDPOINT
 * - Handles messages
 * - Handles uploads
 * - No business logic here
 */
// ...imports...

app.post("/chat", upload.array("files"), async (req, res) => {
  const { claimId, message, userId } = req.body;

  let claim = claimId ? claimsDB.get(claimId) : null;

  if (!claim) {
    claim = createClaim({ userId, message });
  } else if (message) {
    claim.conversation.push({ role: "user", content: message });
  }

  if (req.files?.length) {
    req.files.forEach(file => {
      claim.uploads.push({
        filename: file.filename,
        originalName: file.originalname,
        type: file.mimetype
      });
    });
  }

  let decision;

  while (true) {
    decision = await runClaimBrain(claim, MCP_TOOLS);

    if (decision.action === "CALL_TOOL") {
      const result = await callMCPTool(decision.tool);
      claim.context[decision.tool.name] = result;
      continue;
    }

    break;
  }

  if (decision.risk) {
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
