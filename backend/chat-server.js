import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { initiateClaim } from "./agents/initiate-claims.js";
import { orchestrate } from "./orchestrator/claims-orchestrator.js";
import { claimsDB } from "./db/in-memory-store.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const { claimId, message, userId } = req.body;

  let claim = claimId ? claimsDB.get(claimId) : null;

  if (!claim) {
    claim = initiateClaim(userId, message);
  } else {
    claim.messages.push({ role: "user", content: message });
  }

  claimsDB.set(claim.claimId, claim);
  const response = await orchestrate(claim.claimId);

  res.json({ claimId: claim.claimId, response });
});

app.listen(3000, () =>
  console.log("🤖 Chat server running on port 3000")
);
