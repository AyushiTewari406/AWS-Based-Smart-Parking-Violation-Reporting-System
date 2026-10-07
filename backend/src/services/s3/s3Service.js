import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../../config/env.js";

const s3 = new S3Client({ region: config.region });

const UPLOAD_URL_EXPIRY_SECONDS = 300; // 5 minutes to complete the PUT
const DOWNLOAD_URL_EXPIRY_SECONDS = 900; // 15 minutes to view the evidence

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

function assertAllowedExtension(extension) {
  const ext = String(extension).toLowerCase().replace(".", "");
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }
  return ext;
}

// Returns a short-lived presigned PUT URL the client uploads the photo to
// directly (the Lambda never touches the image bytes). Only evidenceKey
// (never the bucket URL) gets stored on the violation record.
export async function generateUploadUrl(fileExtension, uniqueId) {
  const ext = assertAllowedExtension(fileExtension);
  const evidenceKey = `${config.evidencePrefix}${uniqueId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.evidenceBucket,
    Key: evidenceKey,
    ContentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });
  return { uploadUrl, evidenceKey };
}

// Returns a short-lived presigned GET URL so the frontend can display the
// private evidence photo without the bucket ever being public.
export async function generateDownloadUrl(evidenceKey) {
  const command = new GetObjectCommand({
    Bucket: config.evidenceBucket,
    Key: evidenceKey,
  });
  return getSignedUrl(s3, command, { expiresIn: DOWNLOAD_URL_EXPIRY_SECONDS });
}
