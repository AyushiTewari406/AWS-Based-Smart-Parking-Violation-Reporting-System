import { v4 as uuidv4 } from "uuid";
import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { parseJsonBody, requireFields, validateVehicleNumber, validateViolationCategory, validateLatLng } from "../../utils/validation.js";
import { createViolation } from "../../repositories/violationRepository.js";
import { getVehicleByNumber } from "../../repositories/vehicleRepository.js";
import { calculateFine } from "../../services/violation/severityService.js";
import { checkRepeatViolation } from "../../services/violation/repeatViolationService.js";
import { NotFoundError } from "../../utils/errors.js";
import { VIOLATION_STATUS, PAYMENT_STATUS } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const body = parseJsonBody(event);

  requireFields(body, ["vehicleNumber", "category", "latitude", "longitude"]);
  validateVehicleNumber(body.vehicleNumber);
  validateViolationCategory(body.category);
  validateLatLng(body.latitude, body.longitude);

  const vehicleNumber = body.vehicleNumber.toUpperCase();
  const vehicle = await getVehicleByNumber(vehicleNumber);
  if (!vehicle) {
    throw new NotFoundError("No vehicle registered with this number");
  }

  const { severity, fine } = calculateFine(body.category);
  const repeatInfo = await checkRepeatViolation(vehicle.vehicleId);

  const now = new Date().toISOString();
  const violation = {
    violationId: uuidv4(),
    vehicleId: vehicle.vehicleId,
    vehicleNumber,
    reportedBy: auth.userId,
    category: body.category,
    severity,
    fine,
    status: VIOLATION_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    latitude: body.latitude,
    longitude: body.longitude,
    evidenceKey: body.evidenceKey || null,
    isRepeatOffender: repeatInfo.isRepeatOffender,
    createdAt: now,
    updatedAt: now,
  };

  await createViolation(violation);
  return success(violation, 201);
});