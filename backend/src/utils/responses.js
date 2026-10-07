import { AppError } from "./errors.js";
import { ERROR_CODES } from "./constants.js";

const BASE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

export function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: BASE_HEADERS,
    body: JSON.stringify({ success: true, data }),
  };
}

export function failure(message, statusCode = 500, errorCode = ERROR_CODES.INTERNAL_ERROR) {
  return {
    statusCode,
    headers: BASE_HEADERS,
    body: JSON.stringify({ success: false, message, errorCode }),
  };
}

// Wraps a Lambda handler so every handler gets consistent success/error
// responses without repeating try/catch everywhere.
export function withErrorHandling(handlerFn) {
  return async (event, context) => {
    try {
      return await handlerFn(event, context);
    } catch (err) {
      if (err instanceof AppError) {
        return failure(err.message, err.statusCode, err.errorCode);
      }
      console.error("Unhandled error", {
        requestId: context?.awsRequestId,
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      });
      return failure("An unexpected error occurred. Please try again later.", 500, ERROR_CODES.INTERNAL_ERROR);
    }
  };
}