import fetch from "node-fetch";

const MCP_MAP = {
  govt: "http://localhost:4000/tools/govt",
  policy: "http://localhost:4000/tools/policy",
  hospital: "http://localhost:4000/tools/hospital",
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

export async function retrieveEvidence(claim) {
  claim.context.govt = await call("govt", { person: claim.userId });
  claim.context.policy = await call("policy", { holder: claim.userId });
  claim.context.hospital = await call("hospital", { patient: claim.userId });

  if (claim.uploads.length) {
    claim.context.imageAssessment = await call("imageAssessment", {
      filename: claim.uploads.at(-1).filename
    });
  }

  return claim;
}
