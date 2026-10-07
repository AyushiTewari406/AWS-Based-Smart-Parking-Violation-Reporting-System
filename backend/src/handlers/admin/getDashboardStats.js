import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getViolationsByStatus } from "../../repositories/violationRepository.js";
import { countTableItems } from "../../repositories/statsRepository.js";
import { config } from "../../config/env.js";
import { VIOLATION_STATUS, PAYMENT_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);

  const [pending, verified, rejected, totalUsers, totalVehicles] = await Promise.all([
    getViolationsByStatus(VIOLATION_STATUS.PENDING),
    getViolationsByStatus(VIOLATION_STATUS.VERIFIED),
    getViolationsByStatus(VIOLATION_STATUS.REJECTED),
    countTableItems(config.tables.users),
    countTableItems(config.tables.vehicles),
  ]);

  const totalFinesCollected = verified
    .filter((v) => v.paymentStatus === PAYMENT_STATUS.PAID)
    .reduce((sum, v) => sum + (v.fine || 0), 0);

  const repeatOffenderCount = verified.filter((v) => v.isRepeatOffender).length;

  return success({
    violations: {
      pending: pending.length,
      verified: verified.length,
      rejected: rejected.length,
      total: pending.length + verified.length + rejected.length,
    },
    totalUsers,
    totalVehicles,
    totalFinesCollected,
    repeatOffenderCount,
  });
});
