import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getAllViolations } from "../../repositories/violationRepository.js";
import { VIOLATION_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);
  const violations = await getAllViolations();

  const byVehicle = new Map();
  for (const v of violations) {
    const existing = byVehicle.get(v.vehicleNumber) || {
      vehicleNumber: v.vehicleNumber,
      vehicleId: v.vehicleId,
      count: 0,
      totalFines: 0,
      verifiedCount: 0,
    };
    existing.count += 1;
    existing.totalFines += v.fine || 0;
    if (v.status === VIOLATION_STATUS.VERIFIED) existing.verifiedCount += 1;
    byVehicle.set(v.vehicleNumber, existing);
  }

  const report = Array.from(byVehicle.values())
    .filter((entry) => entry.count >= 2)
    .sort((a, b) => b.count - a.count);

  return success(report);
});
