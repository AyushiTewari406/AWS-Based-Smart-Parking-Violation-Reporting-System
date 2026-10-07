import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth, assertOwnerOrAdmin } from "../../middleware/authMiddleware.js";
import { getVehicleById } from "../../repositories/vehicleRepository.js";
import { NotFoundError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const vehicleId = event.pathParameters?.vehicleId;
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  assertOwnerOrAdmin(auth, vehicle.userId);
  return success(vehicle);
});