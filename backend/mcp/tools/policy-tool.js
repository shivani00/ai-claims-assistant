export async function policyTool(req, res) {
  const { policyId, userId } = req.body;

  res.json({
    policyId: policyId || "POLICY-123",
    userId,
    active: true,
    coverage: ["motor", "health"],
    sumInsured: 500000,
    expiryDate: "2026-12-31"
  });
}
