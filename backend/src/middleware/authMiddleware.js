import { extractTokenFromEvent, verifyToken } from "../services/auth/tokenService.js";
import { ForbiddenError } from "../utils/errors.js";
import { ROLES } from "../utils/constants.js";

// Call at the top of any handler that requires a logged-in user.
// Returns { userId, role, email } decoded from the JWT.
export function requireAuth(event) {
  const token = extractTokenFromEvent(event);
  const claims = verifyToken(token);
  return { userId: claims.sub, role: claims.role, email: claims.email };
}

export function requireAdmin(event) {
  const auth = requireAuth(event);
  if (auth.role !== ROLES.ADMIN) {
    throw new ForbiddenError("Admin privileges required");
  }
  return auth;
}

// Enforces "users can only access their own resource unless they are admin".
export function assertOwnerOrAdmin(auth, resourceOwnerId) {
  if (auth.role === ROLES.ADMIN) return;
  if (auth.userId !== resourceOwnerId) {
    throw new ForbiddenError("You do not have access to this resource");
  }
}