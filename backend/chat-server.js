import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";

import { claimsDB } from "./db/claim-store.js";

import { initiateClaim } from "./agents/initiate-claim-agent.js";
import { retrieveEvidence } from "./agents/evidence-retrieval-agent.js";
import { analyzeEvidenceGaps } from "./agents/evidence-gap-agent.js";
import { assessRisk } from "./agents/risk-agent.js";
import { generateReport } from "./agents/report-agent.js";
import { generateReportPDF } from "./agents/report-pdf-agent.js";
import { detectDuplicateClaims } from "./agents/duplicate-claim-agent.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(bodyParser.json());

/* ======================================================
   GEMINI PLANNER AGENT
====================================================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const plannerModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function planAgents(claim) {
  console.log("🧠 [Planner] Planning agents for claim:", claim.claimId);

  const prompt = `
You are an AI planner for an insurance claim system.

Available agents:
- retrieveEvidence
- analyzeEvidenceGaps
- detectDuplicateClaims
- assessRisk
- generateReport

You MUST always include generateReport.
You SHOULD include detectDuplicateClaims when past claims or repeated entities exist.

Claim context:
${JSON.stringify(claim.context, null, 2)}

Return JSON ONLY:
{
  "agents": []
}
`;

  const result = await plannerModel.generateContent(prompt);
  const text = result.response.text();

  console.log("🧠 [Planner] Raw output:", text);

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  const plan = JSON.parse(text.slice(start, end + 1));
  console.log("🧠 [Planner] Agents selected:", plan.agents);

  return plan;
}

/* ======================================================
   AGENT REGISTRY
====================================================== */
const AGENTS = {
  retrieveEvidence,
  analyzeEvidenceGaps,
  detectDuplicateClaims,
  assessRisk,
  generateReport
};

/* ======================================================
   REQUIRED AGENTS (ENFORCED)
====================================================== */
const REQUIRED_AGENTS = [
  "retrieveEvidence",
  "analyzeEvidenceGaps",
  "detectDuplicateClaims",
  "assessRisk",
  "generateReport"
];

/* ======================================================
   ASYNC AGENT ORCHESTRATION (WITH LOGS)
====================================================== */
async function processClaimAsync(claim) {
  console.log(`🚀 [Claim ${claim.claimId}] Async processing started`);

  try {
    const plan = await planAgents(claim);

    // 🔐 Enforce required agents + deduplicate
    const finalAgents = Array.from(
      new Set([...(plan.agents || []), ...REQUIRED_AGENTS])
    );

    console.log(
      "🧠 [Executor] Final agent execution plan:",
      finalAgents
    );

    let gaps = null;
    let analysis = null;

    for (const agentName of finalAgents) {
      console.log(`⚙️ [Claim ${claim.claimId}] Running agent: ${agentName}`);

      const agent = AGENTS[agentName];
      if (!agent) {
        console.warn(`⚠️ Unknown agent: ${agentName}`);
        continue;
      }

      if (agentName === "retrieveEvidence") {
        await agent(claim);
        console.log("✅ Evidence retrieved");
      }

      if (agentName === "analyzeEvidenceGaps") {
        gaps = agent(claim);
        console.log("📊 Evidence gaps:", gaps);
      }

      if (agentName === "detectDuplicateClaims") {
        const dup = agent(claim);
        claim.duplicateCheck = dup;
        console.log("🔁 Duplicate claim analysis:", dup);
      }

      if (agentName === "assessRisk") {
        analysis = await agent(claim, {
          present: gaps?.presentEvidence || [],
          missing: gaps?.missingEvidence || []
        });
        claim.risk = analysis.risk;
        claim.summary = analysis.summary;
        console.log("⚠️ Risk assessment:", analysis.risk);
      }

      if (agentName === "generateReport") {
        if (!gaps) {
          gaps = analyzeEvidenceGaps(claim);
        }
        if (!analysis) {
          analysis = { risk: claim.risk, summary: claim.summary };
        }

        // JSON report
        claim.reportPath = agent(claim, gaps, analysis);
        console.log("📄 Report generated at:", claim.reportPath);

        // PDF report
        claim.reportPdfPath = generateReportPDF(claim, gaps, analysis);
        console.log("📄 PDF report generated at:", claim.reportPdfPath);
      }
    }

    claim.status = "COMPLETED";
    claimsDB.set(claim.claimId, claim);

    console.log(`🎉 [Claim ${claim.claimId}] Processing completed`);

  } catch (err) {
    console.error(`❌ [Claim ${claim.claimId}] Processing failed`, err);
    claim.status = "ERROR";
    claimsDB.set(claim.claimId, claim);
  }
}

/* ======================================================
   CHAT ENTRY (UI UNCHANGED)
====================================================== */
app.post("/chat", upload.array("files"), async (req, res) => {
  const { userId, message, claimId } = req.body;

  let claim = claimId ? claimsDB.get(claimId) : null;

  if (!claim) {
    console.log("🆕 New claim initiated by:", userId);

    claim = initiateClaim({ userId, message });

    processClaimAsync(claim); // 🔥 ASYNC
  }

  res.json({
    claimId: claim.claimId,
    status: claim.status || "PROCESSING"
  });
});

/* ======================================================
   REPORT DOWNLOAD (JSON)
====================================================== */
app.get("/claims/:id/report", (req, res) => {
  const claim = claimsDB.get(req.params.id);

  if (!claim || !claim.reportPath) {
    console.warn("⏳ Report not ready for claim:", req.params.id);
    return res.status(404).json({ error: "Report not ready" });
  }

  res.sendFile(claim.reportPath, { root: process.cwd() });
});

/* ======================================================
   REPORT DOWNLOAD (PDF)
====================================================== */
app.get("/claims/:id/report/pdf", (req, res) => {
  const claim = claimsDB.get(req.params.id);

  if (!claim || !claim.reportPdfPath) {
    console.warn("⏳ PDF report not ready for claim:", req.params.id);
    return res.status(404).json({ error: "PDF report not ready" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=claim-${claim.claimId}.pdf`
  );

  res.sendFile(claim.reportPdfPath, { root: process.cwd() });
});

/* ======================================================
   SERVER START
====================================================== */
app.listen(3000, () => {
  console.log("🤖 Chat server running on port 3000");
});
