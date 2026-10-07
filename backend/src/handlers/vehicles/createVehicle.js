import { v4 as uuidv4 } from "uuid";
import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { parseJsonBody, requireFields, validateVehicleNumber } from "../../utils/validation.js";
import { createVehicle, getVehicleByNumber } from "../../repositories/vehicleRepository.js";
import { ConflictError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const body = parseJsonBody(event);
  requireFields(body, ["vehicleNumber", "vehicleType"]);
  validateVehicleNumber(body.vehicleNumber);

  const vehicleNumber = body.vehicleNumber.toUpperCase();
  const existing = await getVehicleByNumber(vehicleNumber);
  if (existing) {
    throw new ConflictError("This vehicle is already registered");
  }

  const now = new Date().toISOString();
  const vehicle = {
    vehicleId: uuidv4(),
    userId: auth.userId,
    vehicleNumber,
    vehicleType: body.vehicleType,
    createdAt: now,
    updatedAt: now,
  };

  await createVehicle(vehicle);
  return success(vehicle, 201);
});