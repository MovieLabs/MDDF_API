/**
 * @module api/controllers/artwork
 * @desc Handles functions related to the 'Artwork' route.
 */

const io = require('../../helpers/io');
const eidrMap = require('../../logs/eidrMap');

// Identify EIDR id in string
const eidrRegX = /([A-F0-9]{4}-){5}[A-Z0-9]/;
// Extract dimensions from file name
const dimRegEx = /\d{2,4}x\d{2,4}/;
// Extract file type from filename
const typeRegEx = /.(png|jpg)$/;

// Create mapping of a parent ID to a sibling that we have a record for
const parentMap = {};
const resourceKeys = Object.keys(eidrMap);
resourceKeys.forEach((key) => {
    const contentId = eidrMap[key].contentId.replace('.xml', '');
    parentMap[eidrMap[key].parentId] = contentId;
});

// Upon up a stream to the PNG file, and send back through the response
async function sendResource(params) {
    const { res, database } = params;
    try {
        const imgStream = await database.find(params);
        imgStream.on('open', () => {
            res.setHeader('Content-Type', 'image/png');
            imgStream.pipe(res);
        });
    } catch (err) {
        console.log(err);
        res.status(404)
           .type('plain/text')
           .send('Resource not found');
    }
}

// Find files with artwork that matches a contentId
async function checkForArtwork(searchTerm) {
    const filePath = process.env.ARTWORK_PATH;
    console.log(`File path to artwork files: ${filePath}`);
    const checkFiles = await io.dirSearch(filePath, searchTerm);
    console.log('Matching Files');
    console.log(checkFiles);
    return checkFiles;
}

// Breakdown the filenames for the artwork, so the correct one can be selected
async function artBreakdown(searchTerm) {
    const fileNames = await checkForArtwork(searchTerm);
    if (!fileNames) return null; // If there was an error, return null

    const breakdown = []; // Array for results
    fileNames.forEach((f) => {
        const dimensions = f.match(dimRegEx); // Extract the dimensions from the filename
        const widthHeight = dimensions[0].split('x');
        breakdown.push({
            fileName: f,
            width: +widthHeight[0],
            height: +widthHeight[1],
            fileType: f.match(typeRegEx)[0],
        });
    });
    return breakdown;
}

function findClosestSize(artAssets, width = 0, height = 0) {
    let closestDist = 1000000;
    let closetAsset;
    artAssets.forEach((a) => {
        const totalDist = Math.abs(a.width - width) + Math.abs(a.height - height);
        if (totalDist < closestDist) {
            closestDist = totalDist;
            closetAsset = a;
        }
    });
    return closetAsset;
}

// Map the resource Id to a set of possible files
async function mapArtwork(params) {
    const { res, query, resourceId } = params;

    const eidrMatch = resourceId.match(eidrRegX); // If filename has EIDR in it, add to array
    let eidrId = eidrMatch[0] !== undefined ? eidrMatch[0] : null;

    if (eidrId !== null) {
        // Is the EIDR a parent id, if so map to the UV asset
        const fullEidr = `10.5240/${eidrId}`;
        if (parentMap.hasOwnProperty(fullEidr)) {
            eidrId = parentMap[fullEidr];
        }
        console.log(`Find assets for: ${eidrId}`);
        const artAssets = await artBreakdown(eidrId);
        const closestArt = findClosestSize(artAssets, query.width, query.height);
        params.resourceId = `${closestArt.fileName}`;
        await sendResource(params);
    } else {
        res.status(404)
            .type('plain/text')
            .send('Resource not found');
    }
}

/**
 * Handle the http request for the 'artwork' route
 * @param {object} req - Request object from express
 * @param {object} res - Response object from express
 */

function artGetResource(req, res) {
    const { resourceId } = req.params.trim();
    const { query } = req;
    const { database } = this.dependencies;

    mapArtwork({
        database,
        resourceId,
        query,
        resourceType: 'artwork',
        req,
        res,
    });
}

module.exports = {
    artGetResource,
};
