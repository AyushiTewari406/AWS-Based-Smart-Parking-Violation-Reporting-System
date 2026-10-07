import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { getViolationById } from "../../repositories/violationRepository.js";
import { NotFoundError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  requireAuth(event);
  const violationId = event.pathParameters?.violationId;
  const violation = await getViolationById(violationId);
  if (!violation) throw new NotFoundError("Violation not found");
  return success(violation);
});