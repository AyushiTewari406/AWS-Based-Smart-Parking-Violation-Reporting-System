import { v4 as uuidv4 } from "uuid";
import { withErrorHandling, success } from "../../utils/responses.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { parseJsonBody, requireFields } from "../../utils/validation.js";
import { generateUploadUrl } from "../../services/s3/s3Service.js";

export const handler = withErrorHandling(async (event) => {
  requireAuth(event);
  const body = parseJsonBody(event);
  requireFields(body, ["fileExtension"]);

  const { uploadUrl, evidenceKey } = await generateUploadUrl(body.fileExtension, uuidv4());
  return success({ uploadUrl, evidenceKey });
});
