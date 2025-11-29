import ApiError from '../utils/apierror.js';

/**
 * 404 Not Found Handler
 * Catches all requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(
        404,
        `Route not found: ${req.method} ${req.originalUrl}`,
        [{
            path: req.originalUrl,
            method: req.method,
            message: 'This endpoint does not exist'
        }]
    );
    
    next(error);
};

export default notFoundHandler;
