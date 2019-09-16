/**
 * @module
 * @desc Hnadlers for sending gerneric error messages
 */

/**
 * Send an error response formatted in XML
 * @param errResponse
 * @param errResponse.res {object} - The express response object
 * @param errResponse.errorCode {number} - The HTTP status code, and error code
 * @param errResponse.message {string} - The error message
 * @param errResponse.moreInfo {string} - Optional useful information for the user
 */
function errorResponse(errResponse) {
    const {
        res,
        status,
        applicationType,
        message,
    } = errResponse;

    let xmlMessage = '<?xml version="1.0" encoding="UTF-8"?>'
        + '<Error>'
        + `<errorCode>${status}</errorCode>`
        + `<message>${message}</message>`
        + `<Resource>${res.req.url}</Resource>`;
    xmlMessage += errResponse.hasOwnProperty('moreInfo') ? `<MoreInfo>${errResponse.moreInfo}</MoreInfo>` : '';
    xmlMessage += '</Error>';

    res.status(status)
       .type(applicationType)
       .send(xmlMessage);
}

/**
 * Send a generic server error
 * @param res {object} - Express response object
 */
function serverError(res) {
    const errResponse = {
        res,
        status: 500,
        applicationType: 'application/xml',
        message: 'Undetermined Server Error',
    };
    return errorResponse(errResponse);
}

module.exports = {
    errorResponse,
    serverError,
};
