import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getViolationsByStatus } from "../../repositories/violationRepository.js";
import { VIOLATION_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);
  const violations = await getViolationsByStatus(VIOLATION_STATUS.PENDING);
  return success(violations);
});
