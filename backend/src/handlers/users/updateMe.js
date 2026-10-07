import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { parseJsonBody, validatePhone } from "../../utils/validation.js";
import { updateUser } from "../../repositories/userRepository.js";

const ALLOWED_FIELDS = ["name", "phone"]; // email/role/password change through dedicated flows only

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const body = parseJsonBody(event);

  if (body.phone !== undefined) validatePhone(body.phone);

  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  updates.updatedAt = new Date().toISOString();

  const updated = await updateUser(auth.userId, updates);
  const { passwordHash, ...safeUser } = updated;
  return success(safeUser);
});