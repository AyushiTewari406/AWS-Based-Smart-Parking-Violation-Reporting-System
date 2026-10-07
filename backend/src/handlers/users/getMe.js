import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { getUserById } from "../../repositories/userRepository.js";
import { NotFoundError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  const auth = requireAuth(event);
  const user = await getUserById(auth.userId);
  if (!user) throw new NotFoundError("User not found");
  const { passwordHash, ...safeUser } = user;
  return success(safeUser);
});