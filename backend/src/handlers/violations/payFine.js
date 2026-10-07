import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth, assertOwnerOrAdmin } from "../../middleware/authMiddleware.js";
import { getViolationById, updateViolation } from "../../repositories/violationRepository.js";
import { getVehicleById } from "../../repositories/vehicleRepository.js";
import { notify } from "../../services/notification/notificationService.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";
import { VIOLATION_STATUS, PAYMENT_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const violationId = event.pathParameters?.violationId;

  const violation = await getViolationById(violationId);
  if (!violation) throw new NotFoundError("Violation not found");

  const vehicle = await getVehicleById(violation.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  assertOwnerOrAdmin(auth, vehicle.userId);

  if (violation.status !== VIOLATION_STATUS.VERIFIED) {
    throw new ConflictError("Only verified violations can be paid");
  }
  if (violation.paymentStatus === PAYMENT_STATUS.PAID) {
    throw new ConflictError("This violation has already been paid");
  }

  const updated = await updateViolation(violationId, {
    paymentStatus: PAYMENT_STATUS.PAID,
    paidAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  notify("VIOLATION_PAID", { violationId, vehicleId: violation.vehicleId, fine: violation.fine });
  return success(updated);
});
