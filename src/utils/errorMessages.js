/**
 * User-friendly error messages
 * Maps technical errors to messages that users can understand
 */

const ErrorMessages = {
    // Authentication & Authorization
    UNAUTHORIZED: "You need to be logged in to access this resource",
    INVALID_CREDENTIALS: "Invalid email or password. Please try again",
    TOKEN_EXPIRED: "Your session has expired. Please login again",
    INVALID_TOKEN: "Invalid authentication token. Please login again",
    FORBIDDEN: "You don't have permission to perform this action",
    
    // User Management
    USER_NOT_FOUND: "User account not found",
    USER_ALREADY_EXISTS: "An account with this email or username already exists",
    WEAK_PASSWORD: "Password must be at least 8 characters long",
    INVALID_EMAIL: "Please provide a valid email address",
    
    // Post Management
    POST_NOT_FOUND: "Post not found or has been deleted",
    POST_CREATION_FAILED: "Failed to create post. Please try again",
    EMPTY_POST: "Post must contain text or at least one image",
    POST_UPDATE_FAILED: "Failed to update post. Please try again",
    POST_DELETE_FAILED: "Failed to delete post. Please try again",
    
    // Comment Management
    COMMENT_NOT_FOUND: "Comment not found or has been deleted",
    EMPTY_COMMENT: "Comment cannot be empty",
    COMMENT_CREATION_FAILED: "Failed to add comment. Please try again",
    
    // File Upload
    FILE_TOO_LARGE: "File size exceeds the maximum limit",
    INVALID_FILE_TYPE: "Invalid file type. Please upload a valid image",
    FILE_UPLOAD_FAILED: "File upload failed. Please try again",
    
    // Validation
    REQUIRED_FIELD: "This field is required",
    INVALID_INPUT: "Invalid input provided",
    INVALID_ID: "Invalid ID format",
    
    // Database
    DB_ERROR: "A database error occurred. Please try again later",
    DUPLICATE_ENTRY: "This record already exists",
    
    // General
    INTERNAL_SERVER_ERROR: "Something went wrong on our end. Please try again later",
    NOT_FOUND: "The requested resource was not found",
    BAD_REQUEST: "Invalid request. Please check your input",
};

/**
 * Get user-friendly error message
 * @param {string} errorCode - Error code constant
 * @param {string} fieldName - Optional field name for specific errors
 * @returns {string} User-friendly error message
 */
export const getUserMessage = (errorCode, fieldName = null) => {
    if (fieldName && errorCode === 'REQUIRED_FIELD') {
        return `${fieldName} is required`;
    }
    return ErrorMessages[errorCode] || ErrorMessages.INTERNAL_SERVER_ERROR;
};

/**
 * Format validation errors for API response
 * @param {Object} errors - Validation errors object
 * @returns {Array} Formatted error details array
 */
export const formatValidationErrors = (errors) => {
    return Object.keys(errors).map(field => ({
        field,
        message: errors[field].message || `Invalid ${field}`
    }));
};

export default ErrorMessages;
