/**
 * Controllers for the Media Entertain Core (MEC) routes
 *
 * @param res
 * @param req
 */

const action = require('../../services/api_actions/actions');
const { errorResponse } = require('../responses/errors_response');
const { ApiError } = require('../../loaders/errors_loader');
const { serverError } = require('../responses/errors_response');
const eidrMap = require('../../models/flat_file_db/file_maps/uvFileMap');

// Create mapping of a parent ID to a sibling that we have a record for
const parentMap = {};
const resourceKeys = Object.keys(eidrMap);
const countType = {};
const movies = [];
resourceKeys.forEach((key) => {
    parentMap[eidrMap[key].parentEidr] = eidrMap[key];
    countType[eidrMap[key].parentType] = (countType[eidrMap[key].parentType] += 1) || 1;
    if (eidrMap[key].type === 'Movie') movies.push(eidrMap[key].parentEidr); // All uv movies
});
// Save out a list of all eidr parent movie id's
// const filePath = path.join(io.currentPath(), 'logs/uvids');
// io.saveJSON(filePath, movies);
console.log(countType);

async function checkMapping(params) {
    const { resourceId, database } = params;
    // Check if there is a mapping for this id, and return it
    if (parentMap.hasOwnProperty(resourceId)) return parentMap[resourceId].contentId;
    try {
        await database.find(params); // Double check the database if there is a resource for this id
        return resourceId;
    } catch (err) {
        return resourceId;
    }
}

/**
 * Retrieve a specific resource using http GET
 * If an EIDR, or parent EIDR is provided as the contentId, it will be mapped to a resource in the database
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
async function mecMapResource(req, res) {
    const { database } = this.dependencies;

    const params = {
        database,
        resourceId: req.params.contentId,
        resourceType: 'mec',
        applicationType: 'xml',
    };

    try {
        const contentId = await checkMapping(params);
        params.resourceId = contentId; // Use either the id sent in or a child of the id if it is a parent
        const response = await action.sendResource(params);
        res.status(200)
        .type(`application/${response.applicationType}`)
        .send(response.resource);
    } catch (error) {
        if (error instanceof ApiError) {
            const errResponse = Object.assign(error, {
                applicationType: 'application/xml',
                res,
            });
            return errorResponse(errResponse);
        }
        console.log(error);
        return serverError(res);
    }
    return {};
}


module.exports = {
    mecMapResource,
};
