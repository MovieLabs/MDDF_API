/**
 * @module
 * @desc A set of response patterns for successful API operations
 */

/**
 * Send a success response formatted in XML, when there is no specific payload
 * @param response
 * @param response.res {object} - The express response object
 * @param response.responseCode {number} - The HTTP status code, and error code
 * @param response.message {string} - The error message
 * @param response.moreInfo {string} - Optional useful information for the user
 */
function successResponse(response) {
    const { res, status, message } = response;
    let xmlMessage = '<?xml version="1.0" encoding="UTF-8"?>'
        + '<Response>'
        + `<ResponseCode>${status}</ResponseCode>`
        + `<Message>${message}</message>`
        + `<Resource>${res.req.url}</Resource>`;
    xmlMessage += response.hasOwnProperty('moreInfo') ? `<MoreInfo>${response.moreInfo}</MoreInfo>` : '';
    xmlMessage += '</Response>';

    res.status(status)
       .type('application/xml')
       .send(xmlMessage);
}

module.exports = {
    successResponse,
};
