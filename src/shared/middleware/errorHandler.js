const { sendError } = require('../utils/response');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, `${field} already exists`, 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  return sendError(res, err.message, err.statusCode);
};

const notFoundHandler = (req, res) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
