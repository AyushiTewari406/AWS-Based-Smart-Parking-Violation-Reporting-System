import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAdmin } from "../../middleware/authMiddleware.js";
import { getViolationById, updateViolation } from "../../repositories/violationRepository.js";
import { notify } from "../../services/notification/notificationService.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";
import { VIOLATION_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  requireAdmin(event);
  const violationId = event.pathParameters?.violationId;

  const violation = await getViolationById(violationId);
  if (!violation) throw new NotFoundError("Violation not found");
  if (violation.status !== VIOLATION_STATUS.PENDING) {
    throw new ConflictError("Only pending violations can be verified");
  }

  const updated = await updateViolation(violationId, {
    status: VIOLATION_STATUS.VERIFIED,
    updatedAt: new Date().toISOString(),
  });

  notify("VIOLATION_VERIFIED", { violationId, vehicleId: violation.vehicleId, fine: violation.fine });
  return success(updated);
});
