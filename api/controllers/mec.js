/**
 * Controllers for the Media Entertain Core (MEC) routes
 *
 * @param res
 * @param req
 */

const action = require('../../helpers/actions');
const validate = require('../../helpers/validate');

/**
 * Retrieve a specific MEC resource using http GET
 * If the resource exists the XML data will be returned, otherwise a 4XX error will be returned
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
function mecGetResource(req, res) {
    const { contentId } = req.params; // The content id of the requested resource
    const { database } = this.dependencies; // The injected database interface

    const params = {
        database,
        resourceId: contentId,
        resourceType: 'mec',
        applicationType: 'xml',
        req,
        res,
    };

    if (contentId.toLowerCase() === 'getcount') {
        action.countResource(params);
    } else {
        action.sendResource(params);
    }
}

/**
 * Add or put data (XML) for a new resource
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
function mecPutResource(req, res) {
    const { contentId } = req.params; // The content id of the resource to add
    const { database } = this.dependencies; // The injected database interface
    console.log(`Update the resource for: ${contentId}`);

    action.updateResource({
        database,
        resource: req.body, // The XML data to be added
        resourceId: contentId,
        resourceType: 'test',
        applicationType: 'xml',
        req,
        res,
    });
}

/**
 * Delete data for a resource
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
function mecDeleteResource(req, res) {
    const { contentId } = req.params; // The content id of the resource to be deleted
    const { database } = this.dependencies; // The injected database interface
    console.log(`Delete the resource for: ${contentId}`);

    action.removeResource({
        database,
        resourceId: contentId,
        resourceType: 'test',
        applicationType: 'xml',
        req,
        res,
    });
}

/**
 * Update data for an existing resource
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
function mecPostResource(req, res) {
    const { contentId } = req.params;
    const { database } = this.dependencies;
    console.log(`Create the resource for: ${contentId}`);

    action.saveResource({
        database,
        resource: req.body,
        resourceId: contentId,
        resourceType: 'test',
        applicationType: 'xml',
        req,
        res,
    });
}

module.exports = {
    mecGetResource,
    mecPutResource,
    mecDeleteResource,
    mecPostResource,
};
