import { ValidationError } from "./errors.js";
import { VIOLATION_CATEGORIES } from "./constants.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;
// Loose Indian vehicle-number pattern (e.g. TN01AB1234). Not every real
// registration fits this exactly — see the note in Step 6 explanation below.
const VEHICLE_NUMBER_RE = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/i;

export function requireFields(obj, fields) {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === "");
  if (missing.length > 0) {
    throw new ValidationError(`Missing required field(s): ${missing.join(", ")}`);
  }
}

export function validateEmail(email) {
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    throw new ValidationError("Invalid email address");
  }
}

export function validatePhone(phone) {
  if (typeof phone !== "string" || !PHONE_RE.test(phone)) {
    throw new ValidationError("Invalid phone number");
  }
}

export function validateVehicleNumber(vehicleNumber) {
  if (typeof vehicleNumber !== "string" || !VEHICLE_NUMBER_RE.test(vehicleNumber)) {
    throw new ValidationError("Invalid vehicle number format");
  }
}

export function validateViolationCategory(category) {
  if (!VIOLATION_CATEGORIES.includes(category)) {
    throw new ValidationError(
      `Invalid violation category. Must be one of: ${VIOLATION_CATEGORIES.join(", ")}`
    );
  }
}

export function validateLatLng(latitude, longitude) {
  if (latitude === undefined && longitude === undefined) return;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    throw new ValidationError("Invalid latitude");
  }
  if (Number.isNaN(lng) || lng < -180 || lng > 180) {
    throw new ValidationError("Invalid longitude");
  }
}

export function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
}