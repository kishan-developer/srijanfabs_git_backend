/**
 * Middleware to attach custom response methods to the res object.
 * Adds `res.success()` and `res.error()` for consistent API responses.
 *
 * @function sendCustomResponse
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * Usage:
 *   res.success("Message", data); // for success responses
 *   res.error("Error message", 400); // for error responses
 */
const sendCustomResponse = (req, res, next) => {
    /**
     * Send a standard success response
     * @param {string} message - Response message (default: "Success")
     * @param {Object} data - Payload/data to send (default: empty object)
     */
    res.success = (message = "Success", data = {}) => {
        res.status(200).json({
            success: true,
            message,
            data,
        });
    };

    /**
     * Send a standard error response
     * @param {string} message - Error message (default: "Something went wrong")
     * @param {number} code - HTTP status code (default: 500)
     */
    res.error = (message = "Something went wrong", code = 500) => {
        res.status(code).json({
            success: false,
            message,
        });
    };

    next();
};

module.exports = sendCustomResponse;
