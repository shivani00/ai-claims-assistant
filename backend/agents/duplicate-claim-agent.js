export function detectDuplicateClaims(claim) {
  const signals = [];
  let duplicateScore = 0;

  const govt = claim.context.govt || [];
  const pastClaims = claim.context.pastClaims || [];

  // Simple heuristic checks (can be improved later)
  if (pastClaims.length > 0) {
    duplicateScore += 0.4;
    signals.push("User has prior claims history");
  }

  const vehicleMatches = pastClaims.filter(
    c => c.includes("Vehicle Number")
  );

  if (vehicleMatches.length > 0) {
    duplicateScore += 0.4;
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
