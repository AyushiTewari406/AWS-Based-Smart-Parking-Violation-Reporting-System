import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth, assertOwnerOrAdmin } from "../../middleware/authMiddleware.js";
import { parseJsonBody } from "../../utils/validation.js";
import { getVehicleById, updateVehicle } from "../../repositories/vehicleRepository.js";
import { NotFoundError } from "../../utils/errors.js";

const ALLOWED_FIELDS = ["vehicleType"]; // vehicleNumber is immutable once registered

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const vehicleId = event.pathParameters?.vehicleId;
  const existing = await getVehicleById(vehicleId);
  if (!existing) throw new NotFoundError("Vehicle not found");
  assertOwnerOrAdmin(auth, existing.userId);

  const body = parseJsonBody(event);
  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  updates.updatedAt = new Date().toISOString();

  const updated = await updateVehicle(vehicleId, updates);
  return success(updated);
});