import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { getVehiclesByUser } from "../../repositories/vehicleRepository.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const vehicles = await getVehiclesByUser(auth.userId);
  return success(vehicles);
});