/**
 * Controllers for the Media Entertain Core (MEC) routes
 *
 * @param res
 * @param req
 */

const database = require('../../database/database');

function mec(req, res) {
    const id = req.swagger.params.id.originalValue;
    console.log(`On the MEC route, requesting ${id}`);
    // console.log(req);
    res.json(`Successfully reached the MEC route for ${id}`);
}

async function sendResource(id, res) {
    const testXML = await database.find(id);
    if (testXML) {
        res.status(200)
            .type('application/xml')
            .send(testXML);
    } else {
        res.status(404)
            .type('plain/text')
            .send('Resource not found');
    }
}

function getResource(req, res) {
    const id = req.swagger.params.id.originalValue;
    console.log('On the MEC route');
    sendResource(id, res);
}

module.exports = {
    mec,
    getResource,
};
