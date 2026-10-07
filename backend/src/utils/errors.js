import { ERROR_CODES } from "./constants.js";

export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, ERROR_CODES.FORBIDDEN);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, ERROR_CODES.NOT_FOUND);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, ERROR_CODES.CONFLICT);
    this.name = "ConflictError";
  }
}