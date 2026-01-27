import { AppError } from '../utils/AppError.js';

// Re-export AppError for backwards compatibility
export { AppError };

/**
 * Middleware to attach a standardized success response method
 * (Legacy support for older controllers if any)
 */
export const responseHandler = (req, res, next) => {
  res.sendSuccess = (statusCode, message, data) => {
    res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  };
  next();
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: Don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        statusCode: err.statusCode,
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or other unknown error
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
};

/**
 * Wrapper to handle controller execution and standardized response.
 * Expects the controller to return { statusCode, message, data }.
 */
export const requestHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        if (!result) return;
        const { statusCode = 200, message = 'Success', data } = result;
        res.status(statusCode).json({
          status: 'success',
          message,
          data
        });
      })
      .catch(next);
  };
};
