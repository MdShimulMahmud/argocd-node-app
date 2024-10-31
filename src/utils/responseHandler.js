/**
 * Response Handler Utility for MongoDB Projects
 */
class ResponseHandler {
  /**
   * Standard success response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response data
   * @param {string} [message='Success'] - Optional success message
   */
  static success(res, statusCode, data, message = "Success") {
    return res.status(statusCode).json({
      success: true,
      status: statusCode,
      message,
      data: data || null,
    });
  }

  /**
   * Standard error response
   * @param {Object} res - Express response object
   * @param {Error|string} err - Error object or message
   * @param {number} [statusCode=500] - HTTP status code
   */
  static error(res, err, statusCode = 500) {
    // Determine error message
    const errorMessage =
      err instanceof Error
        ? err.message
        : err || "An unexpected error occurred";

    // Prepare error response
    const errorResponse = {
      success: false,
      status: statusCode,
      message: errorMessage,
      // Include stack trace only in development
      ...(process.env.NODE_ENV === "development" && {
        stack: err instanceof Error ? err.stack : undefined,
      }),
    };

    return res.status(statusCode).json(errorResponse);
  }

  /**
   * Validation error response for missing fields
   * @param {Object} res - Express response object
   * @param {string[]} missingFields - List of missing required fields
   */
  static validationError(res, missingFields) {
    return this.error(
      res,
      `Missing required fields: ${missingFields.join(", ")}`,
      400
    );
  }

  /**
   * Async handler wrapper to catch and handle errors
   * @param {Function} fn - Async controller function
   * @returns {Function} Wrapped async handler
   */
  static asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        // Log the error for server-side tracking
        console.error("Unhandled Error:", err.message);

        // Handle specific MongoDB errors
        if (err.name === "ValidationError") {
          // Mongoose validation error
          const errors = Object.values(err.errors).map(
            (error) =>
              `${process.env.NODE_ENV === "development"}? ${error.path}: ${
                error.message
              }`
          );
          return this.error(
            res,
            `Validation Failed: ${errors.join(", ")}`,
            400
          );
        }

        if (err.name === "CastError") {
          // Invalid ID or type casting error
          return this.error(res, `Invalid data format for ${err.path}`, 400);
        }

        if (err.code === 11000) {
          // Duplicate key error
          return this.error(res, "Duplicate key error", 409);
        }

        // Generic server error
        this.error(res, err);
      }
    };
  }
}

/**
 * Utility function to find a document by ID
 * @param {Object} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} res - Express response object
 * @returns {Object|null} Found document or null
 */
export const findDocumentById = async (Model, id, res) => {
  try {
    const document = await Model.findById(id);

    if (!document) {
      ResponseHandler.error(res, "Resource not found", 404);
      return null;
    }

    return document;
  } catch (err) {
    ResponseHandler.error(res, err);
    return null;
  }
};

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {string[]} requiredFields - List of required fields
 * @returns {string[]} Array of missing fields
 */
export const validateRequiredFields = (body, requiredFields) => {
  return requiredFields.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === ""
  );
};

export default ResponseHandler;
