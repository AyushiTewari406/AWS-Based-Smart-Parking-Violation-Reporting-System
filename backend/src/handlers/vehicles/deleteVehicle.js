import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth, assertOwnerOrAdmin } from "../../middleware/authMiddleware.js";
import { getVehicleById, deleteVehicle } from "../../repositories/vehicleRepository.js";
import { NotFoundError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const vehicleId = event.pathParameters?.vehicleId;
  const existing = await getVehicleById(vehicleId);
  if (!existing) throw new NotFoundError("Vehicle not found");
  assertOwnerOrAdmin(auth, existing.userId);

  await deleteVehicle(vehicleId);
  return success({ message: "Vehicle deleted successfully" });
});