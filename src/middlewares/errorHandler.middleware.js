import ApiError from '../utils/apierror.js';
import { formatValidationErrors } from '../utils/errorMessages.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them into consistent API responses
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // If it's not an ApiError, convert it
    if (!(error instanceof ApiError)) {
        // Mongoose Validation Error
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => ({
                field: e.path,
                message: e.message
            }));
            error = new ApiError(400, 'Validation failed', errors);
        }
        // Mongoose CastError (Invalid ObjectId)
        else if (error.name === 'CastError') {
            const message = `Invalid ${error.path}: ${error.value}`;
            error = new ApiError(400, message);
        }
        // MongoDB Duplicate Key Error
        else if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];
            const message = `An account with this ${field} already exists`;
            error = new ApiError(409, message, [{ field, message: `${field} '${value}' is already taken` }]);
        }
        // JWT Errors
        else if (error.name === 'JsonWebTokenError') {
            error = new ApiError(401, 'Invalid authentication token. Please login again');
        }
        else if (error.name === 'TokenExpiredError') {
            error = new ApiError(401, 'Your session has expired. Please login again');
        }
        // Multer File Upload Errors
        else if (error.name === 'MulterError') {
            if (error.code === 'LIMIT_FILE_SIZE') {
                error = new ApiError(400, 'File size exceeds the maximum limit');
            } else if (error.code === 'LIMIT_FILE_COUNT') {
                error = new ApiError(400, 'Too many files uploaded');
            } else {
                error = new ApiError(400, error.message);
            }
        }
        // Generic Programming Error
        else {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            error = new ApiError(statusCode, message, [], error.stack);
            error.isOperational = false; // Programming error
        }
    }

    // Log error for debugging (in development mode show more details)
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error Details:');
        console.error('Message:', error.message);
        console.error('Status Code:', error.statuscode);
        if (error.errors && error.errors.length > 0) {
            console.error('Validation Errors:', error.errors);
        }
        console.error('Stack:', error.stack);
        console.error('Request URL:', req.originalUrl);
        console.error('Request Method:', req.method);
    } else {
        // In production, log only essential info
        console.error(`❌ ${error.statuscode} - ${error.message} - ${req.originalUrl} - ${req.method}`);
    }

    // Prepare response
    const response = {
        statuscode: error.statuscode || 500,
        success: false,
        message: error.message || 'Something went wrong',
        data: null
    };

    // Add error details
    if (process.env.NODE_ENV === 'development') {
        // In development, send detailed error information
        response.error = {
            message: error.message,
            stack: error.stack,
            errors: error.errors || []
        };
    } else {
        // In production, only send user-friendly error info
        response.error = {
            message: error.message,
            errors: error.errors || []
        };
        
        // Don't leak stack traces or internal errors in production
        if (!error.isOperational) {
            response.message = 'Internal server error';
            response.error = {
                message: 'An unexpected error occurred. Please try again later'
            };
        }
    }

    // Send response
    res.status(error.statuscode || 500).json(response);
};

export default errorHandler;
