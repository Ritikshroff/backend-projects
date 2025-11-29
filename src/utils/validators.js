import mongoose from 'mongoose';
import ApiError from './apierror.js';

/**
 * Validation utilities for request data
 */

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {ApiError} If ID is invalid
 */
export const validateObjectId = (id, fieldName = 'ID') => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ${fieldName} format`);
    }
};

/**
 * Validate required fields in request body
 * @param {Object} data - Request body data
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {ApiError} If any required field is missing
 */
export const validateRequiredFields = (data, requiredFields) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        const errors = missingFields.map(field => ({
            field,
            message: `${field} is required`
        }));
        throw new ApiError(400, 'Missing required fields', errors);
    }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long'
        };
    }
    
    // Add more password rules if needed
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /\d/.test(password);
    
    return { isValid: true, message: '' };
};

/**
 * Validate pagination parameters
 * @param {number|string} page - Page number
 * @param {number|string} limit - Items per page
 * @returns {Object} Validated { page, limit }
 */
export const validatePagination = (page = 1, limit = 10) => {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    
    return {
        page: Math.max(1, parsedPage),
        limit: Math.min(100, Math.max(1, parsedLimit)) // Max 100 items per page
    };
};

/**
 * Validate file upload (for multer)
 * @param {Object} file - Uploaded file object
 * @param {Array<string>} allowedMimeTypes - Array of allowed MIME types
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @throws {ApiError} If file is invalid
 */
export const validateFileUpload = (file, allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxSizeInMB = 5) => {
    if (!file) {
        throw new ApiError(400, 'No file uploaded');
    }
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiError(400, `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        throw new ApiError(400, `File size exceeds ${maxSizeInMB}MB limit`);
    }
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/[<>]/g, ''); // Basic XSS prevention
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateUsername = (username) => {
    if (!username || username.length < 3) {
        return {
            isValid: false,
            message: 'Username must be at least 3 characters long'
        };
    }
    
    if (username.length > 30) {
        return {
            isValid: false,
            message: 'Username must be less than 30 characters'
        };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return {
            isValid: false,
            message: 'Username can only contain letters, numbers, and underscores'
        };
    }
    
    return { isValid: true, message: '' };
};
