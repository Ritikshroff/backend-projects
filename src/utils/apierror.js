class ApiError extends Error {
    constructor(
        statuscode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statuscode = statuscode;
        this.data = null;
        this.success = false;
        this.message = message;
        this.errors = errors;
        this.isOperational = true; // Mark as operational error (expected errors)

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;