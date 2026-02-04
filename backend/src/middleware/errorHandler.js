import logger from '../config/logger.js';

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error({
    type: 'ERROR',
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal server error';

  // Validation errors
  if (err.statusCode === 400) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  }

  // Auth errors
  if (err.statusCode === 401) {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  }

  // Not found errors
  if (err.statusCode === 404) {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  });
};

export default errorHandler;
