import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getAllViolations } from "../../repositories/violationRepository.js";
import { ValidationError } from "../../utils/errors.js";
import { VIOLATION_STATUS, PAYMENT_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);

  const qs = event.queryStringParameters || {};
  const year = Number(qs.year);
  const month = Number(qs.month); // 1-12

  if (!year || !month || month < 1 || month > 12) {
    throw new ValidationError("Query parameters 'year' and 'month' (1-12) are required");
  }

  const allViolations = await getAllViolations();
  const inMonth = allViolations.filter((v) => {
    const d = new Date(v.createdAt);
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
  });

  const byCategory = {};
  for (const v of inMonth) {
    byCategory[v.category] = (byCategory[v.category] || 0) + 1;
  }

  const verifiedCount = inMonth.filter((v) => v.status === VIOLATION_STATUS.VERIFIED).length;
  const rejectedCount = inMonth.filter((v) => v.status === VIOLATION_STATUS.REJECTED).length;
  const pendingCount = inMonth.filter((v) => v.status === VIOLATION_STATUS.PENDING).length;
  const totalFinesCollected = inMonth
    .filter((v) => v.paymentStatus === PAYMENT_STATUS.PAID)
    .reduce((sum, v) => sum + (v.fine || 0), 0);

  return success({
    year,
    month,
    totalViolations: inMonth.length,
    byCategory,
    verifiedCount,
    rejectedCount,
    pendingCount,
    totalFinesCollected,
  });
});
