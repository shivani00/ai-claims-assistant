export function detectDuplicateClaims(claim) {
  const signals = [];
  let duplicateScore = 0;

  const pastClaimsContext = claim.context.pastClaims;

  // ✅ Safely extract documents array
  const pastClaimsDocs = Array.isArray(pastClaimsContext?.retrievedDocs)
    ? pastClaimsContext.retrievedDocs
    : [];

  const userId = claim.userId.toLowerCase().replace(/\s+/g, "_");

  // ✅ Only consider claims belonging to THIS user
  const userSpecificClaims = pastClaimsDocs.filter(doc =>
    doc.metadata &&
    doc.metadata.source === "past-claims" &&
    doc.metadata.userHint === userId
  );

  if (userSpecificClaims.length > 0) {
    duplicateScore += 0.6;
    signals.push("User has prior claims history");
  }

  const vehicleMatches = userSpecificClaims.filter(doc =>
    doc.pageContent.toLowerCase().includes("vehicle number")
  );

  if (vehicleMatches.length > 0) {
    duplicateScore += 0.3;
    signals.push("Same vehicle involved in previous claims");
  }

  if (duplicateScore === 0) {
    signals.push("No duplicate claim indicators detected");
  }

  return {
    isPotentialDuplicate: duplicateScore >= 0.5,
    confidence: Math.min(duplicateScore, 1),
    signals
  };
}
