import fetch from "node-fetch";
import { queryRAG } from "../rag/query.js";

const MCP_MAP = {
  govt: "http://localhost:4000/tools/govt",
  policy: "http://localhost:4000/tools/policy",
  hospital: "http://localhost:4000/tools/hospital",
  pastClaims: "http://localhost:4000/tools/past-claims"
  imageAssessment: "http://localhost:4000/tools/image-classifier"
};

async function call(tool, args) {
  const res = await fetch(MCP_MAP[tool], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  return res.json();
}

function normalizeUserId(userId) {
  return userId.toLowerCase().replace(/\s+/g, "_");
}

export async function retrieveEvidence(claim) {
  const userHint = normalizeUserId(claim.userId);

  /* ======================
     CORE EVIDENCE (MCP)
  ====================== */
  claim.context.govt = await call("govt", { person: claim.userId });
  claim.context.policy = await call("policy", { holder: claim.userId });
  claim.context.hospital = await call("hospital", { patient: claim.userId });
  claim.context.pastClaims = await call("pastClaims", { person: claim.userId });

  /* ======================
     IMAGE METADATA (RAG)
  ====================== */
  const imageDocs = await queryRAG(
    `accident image damage photo ${claim.userId}`
  );

  // Only keep images belonging to THIS user
  const userImages = imageDocs.filter(doc =>
    doc.metadata &&
    doc.metadata.source === "images" &&
    doc.metadata.userHint === userHint
  );

  if (userImages.length > 0) {
    console.log(
      `🖼️ Found ${userImages.length} image metadata docs for user`
    );

    // Pick the most relevant image (latest / first)
    const imageFile = userImages[0].metadata.filename;

    claim.context.imageAssessment = await call("imageAssessment", {
      filename: imageFile
    });

    console.log("🖼️ Image assessment completed for:", imageFile);
  }

  /* ======================
     UPLOADED IMAGES (OVERRIDE)
  ====================== */
  if (claim.uploads.length) {
    const uploadedFile = claim.uploads.at(-1).filename;

    claim.context.imageAssessment = await call("imageAssessment", {
      filename: uploadedFile
    });

    console.log("🖼️ Image assessment from uploaded file:", uploadedFile);
  }

  return claim;
}
