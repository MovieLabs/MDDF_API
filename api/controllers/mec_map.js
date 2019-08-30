/**
 * Controllers for the Media Entertain Core (MEC) routes
 *
 * @param res
 * @param req
 */
console.log('Load map at Mec-Map');
const eidrMap = require('../../logs/eidrMap');

// Create mapping of a parent ID to a sibling that we have a record for
const parentMap = {};
const resourceKeys = Object.keys(eidrMap);
resourceKeys.forEach((key) => {
    const contentId = eidrMap[key].contentId.replace('.xml', '');
    parentMap[eidrMap[key].parentId] = contentId;
});

async function checkMapping(params) {
    const {resourceId, database} = params;
    try {
        await database.find(params); // Check if there is a resource for this id
        return params.resourceId;
    } catch (err) {
        // If not return a child id if there is one
        console.log(parentMap[resourceId]);
        return parentMap.hasOwnProperty(resourceId) ? parentMap[resourceId] : resourceId;
    }
}


async function sendResource(params) {
    const {res, database} = params;
    try {
        const resourceXML = await database.find(params);
        res.status(200)
            .type('application/xml')
            .send(resourceXML);
    } catch (err) {
        res.status(404)
            .type('plain/text')
            .send('Resource not found');
    }
}

async function selectResource(params) {
    params.resourceId = await checkMapping(params); // Use either the id sent in or a child of the id if it is a parent
    sendResource(params);
}


function mecMapResource(req, res) {
    const {database} = this.dependencies;
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
