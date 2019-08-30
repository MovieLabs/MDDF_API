

async function sendResource(params) {
    const { res, database } = params;
    try {
        const PNGstream = await database.find(params);
        PNGstream.on('open', () => {
            res.setHeader('Content-Type', 'image/JPG');
            PNGstream.pipe(res);
        });
    } catch (err) {
        res.status(404)
            .type('plain/text')
            .send('Resource not found');
    }
}

function artGetResource(req, res) {
    const {resourceId} = req.params;
    const {database} = this.dependencies;

    sendResource({
        database,
        resourceId,
        resourceType: 'artwork',
        req,
        res,
    });
}

module.exports = {
    artGetResource,
};
