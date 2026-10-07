import { v4 as uuidv4 } from "uuid";
import { withErrorHandling, success } from "../../utils/responses.js";
import { parseJsonBody, requireFields, validateEmail, validatePhone } from "../../utils/validation.js";
import { hashPassword, assertPasswordStrength } from "../../services/auth/passwordService.js";
import { signToken } from "../../services/auth/tokenService.js";
import { createUser, getUserByEmail } from "../../repositories/userRepository.js";
import { ConflictError, ValidationError } from "../../utils/errors.js";
import { ROLES } from "../../utils/constants.js";

export const handler = withErrorHandling(async (event) => {
  const body = parseJsonBody(event);
  requireFields(body, ["name", "email", "phone", "password"]);
  validateEmail(body.email);
  validatePhone(body.phone);

  try {
    assertPasswordStrength(body.password);
  } catch (err) {
    throw new ValidationError(err.message);
  }

  const existing = await getUserByEmail(body.email);
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const now = new Date().toISOString();
  const user = {
    userId: uuidv4(),
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: await hashPassword(body.password),
    role: ROLES.USER,
    createdAt: now,
    updatedAt: now,
  };

  await createUser(user);

  const token = signToken({ sub: user.userId, role: user.role, email: user.email });
  const { passwordHash, ...safeUser } = user;
  return success({ user: safeUser, token }, 201);
});