/**
 * @module
 * @desc Definitions fop custom errors
 */

function ApiError(error) {
    this.message = error.message || null;
    this.status = error.status || null;
    this.applicationType = error.applicationType || null;
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ApiError);
    }
}

ApiError.prototype = new Error();

module.exports = {
    ApiError,
};
