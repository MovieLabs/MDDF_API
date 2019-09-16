/**
 * Controllers for the Media Entertain Core (MEC) routes
 *
 * @param res
 * @param req
 */

const action = require('../../services/api_actions/actions');
const eidrMap = require('../../logs/uvFileMap');

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

async function selectResource(params) {
    const contentId = await checkMapping(params);
    params.resourceId = contentId; // Use either the id sent in or a child of the id if it is a parent
    action.sendResource(params);
}

/**
 * Retrieve a specific resource using http GET
 * If an EIDR, or parent EIDR is provided as the contentId, it will be mapped to a resource in the database
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
function mecMapResource(req, res) {
    const { database } = this.dependencies;
    const params = {
        database,
        resourceId: req.params.contentId,
        resourceType: 'mec',
        req,
        res,
    };
    selectResource(params);
}

module.exports = {
    mecMapResource,
};
