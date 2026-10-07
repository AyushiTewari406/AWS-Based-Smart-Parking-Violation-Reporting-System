import { VIOLATION_RULES, FINE_BY_SEVERITY } from "../../utils/constants.js";
import { ValidationError } from "../../utils/errors.js";

export function getSeverityForCategory(category) {
  const rule = VIOLATION_RULES[category];
  if (!rule) {
    throw new ValidationError(`Unknown violation category: ${category}`);
  }
  return rule.severity;
}

export function getFineForSeverity(severity) {
  const fine = FINE_BY_SEVERITY[severity];
  if (fine === undefined) {
    throw new ValidationError(`Unknown severity level: ${severity}`);
  }
  return fine;
}

export function calculateFine(category) {
  const severity = getSeverityForCategory(category);
  const baseFine = getFineForSeverity(severity);
  return { severity, fine: baseFine };
}