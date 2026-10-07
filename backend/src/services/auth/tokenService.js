import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";
import { UnauthorizedError } from "../../utils/errors.js";

function getSecret() {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return config.jwt.secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: config.jwt.expiry });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

// Extracts "Bearer <token>" from an API Gateway event's Authorization header.
export function extractTokenFromEvent(event) {
  const header = event.headers?.Authorization || event.headers?.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Missing or malformed Authorization header");
  }
  return token;
}