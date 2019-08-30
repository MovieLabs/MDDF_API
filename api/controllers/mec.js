/**
 * Controllers for the Media Entertain Core (MEC) routes
 *
 * @param res
 * @param req
 */

function mec(req, res) {
    const id = req.swagger.params.id.originalValue;
    console.log(`On the MEC route, requesting ${id}`);
    // console.log(req);
    res.json(`Successfully reached the MEC route for ${id}`);
}

async function sendResource(params) {
    const { res, database } = params;
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

function mecGetResource(req, res) {
    const resourceId = req.params.contentId;
    const {database} = this.dependencies;

    sendResource({
        database,
        resourceId,
        resourceType: 'mec',
        req,
        res,
    });
}

function mecPutResource(req, res) {
    const {contentId} = req.params;
    const xml = req.body;
    const {database} = this.dependencies;
    console.log(`Update the resource for: ${contentId}`);
    res.status(200)
        .send();
}

function mecDeleteResource(req, res) {
    const {contentId} = req.params;
    const {database} = this.dependencies;
    console.log(`Delete the resource for: ${contentId}`);
    res.status(200)
        .send();
}

function mecPostResource(req, res) {
    const {contentId} = req.params;
    const xml = req.body;
    const {database} = this.dependencies;
    console.log(`Create the resource for: ${contentId}`);
    res.status(201)
        .send();
}

module.exports = {
    mecGetResource,
    mecPutResource,
    mecDeleteResource,
    mecPostResource,
};
