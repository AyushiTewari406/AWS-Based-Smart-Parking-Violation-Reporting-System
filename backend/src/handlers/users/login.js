import { withErrorHandling, success } from "../../utils/responses.js";
import { parseJsonBody, requireFields, validateEmail } from "../../utils/validation.js";
import { verifyPassword } from "../../services/auth/passwordService.js";
import { signToken } from "../../services/auth/tokenService.js";
import { getUserByEmail } from "../../repositories/userRepository.js";
import { UnauthorizedError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  const body = parseJsonBody(event);
  requireFields(body, ["email", "password"]);
  validateEmail(body.email);

  const user = await getUserByEmail(body.email);

  // Same error whether the user doesn't exist or the password is wrong —
  // never reveal which one it was, that's an account-enumeration leak.
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({ sub: user.userId, role: user.role, email: user.email });
  const { passwordHash, ...safeUser } = user;
  return success({ user: safeUser, token });
});