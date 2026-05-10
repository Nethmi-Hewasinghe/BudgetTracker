import { AppError } from "../utils/AppError.js";

export function errorHandler(err, _req, res, _next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  const payload = {
    message: err.message || "Server error",
  };

  if (err?.details) payload.details = err.details;

  if (process.env.NODE_ENV !== "production" && !isAppError) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

