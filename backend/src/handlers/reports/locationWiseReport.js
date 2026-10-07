import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getAllViolations } from "../../repositories/violationRepository.js";

// Groups violations into rough geographic buckets by rounding lat/lng to
// 3 decimal places (~111m resolution at the equator). This is a simple
// hotspot report, not a true geospatial query — DynamoDB has no native
// geo index, and a precise version would need a geohash GSI.
function roundCoord(n) {
  return Math.round(Number(n) * 1000) / 1000;
}

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);
  const violations = await getAllViolations();

  const buckets = new Map();
  for (const v of violations) {
    if (v.latitude === undefined || v.longitude === undefined) continue;
    const key = `${roundCoord(v.latitude)},${roundCoord(v.longitude)}`;
    const existing = buckets.get(key) || { location: key, count: 0, totalFine: 0 };
    existing.count += 1;
    existing.totalFine += v.fine || 0;
    buckets.set(key, existing);
  }

  const report = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
  return success(report);
});
