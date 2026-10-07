import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { getViolationsByVehicle } from "../../repositories/violationRepository.js";
import { getVehicleById } from "../../repositories/vehicleRepository.js";
import { NotFoundError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  requireAuth(event);
  const vehicleId = event.pathParameters?.vehicleId;

  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found");

  const violations = await getViolationsByVehicle(vehicleId);
  return success(violations);
});