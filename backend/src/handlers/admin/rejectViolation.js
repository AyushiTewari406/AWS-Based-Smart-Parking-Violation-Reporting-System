import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getViolationById, updateViolation } from "../../repositories/violationRepository.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";
import { VIOLATION_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);
  const violationId = event.pathParameters?.violationId;

  const violation = await getViolationById(violationId);
  if (!violation) throw new NotFoundError("Violation not found");
  if (violation.status !== VIOLATION_STATUS.PENDING) {
    throw new ConflictError("Only pending violations can be rejected");
  }

  const updated = await updateViolation(violationId, {
    status: VIOLATION_STATUS.REJECTED,
    updatedAt: new Date().toISOString(),
  });
  return success(updated);
});
