import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { getViolationById } from "../../repositories/violationRepository.js";
import { generateDownloadUrl } from "../../services/s3/s3Service.js";
import { NotFoundError } from "../../utils/errors.js";

export const handler = withErrorHandling(async (event) => {
  requireAuth(event);
  const violationId = event.pathParameters?.violationId;

  const violation = await getViolationById(violationId);
  if (!violation) throw new NotFoundError("Violation not found");
  if (!violation.evidenceKey) throw new NotFoundError("No evidence attached to this violation");

  const url = await generateDownloadUrl(violation.evidenceKey);
  return success({ evidenceUrl: url });
});
