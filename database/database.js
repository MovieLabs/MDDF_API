/**
 * An abstraction layer for saving a retrieving resources
 */


const path = require('path');
const io = require('./io');


const xmlPath = process.env.XML_PATH || 'Didn\'t find the path';
const artworkPath = process.env.ARTWORK_PATH || 'Didn\'t find the path';
const currentDir = path.basename(__dirname);

function currentPath() {
    return __dirname.slice(0, __dirname.indexOf(currentDir) - 1);
}




/**
 * Find and retrieve a resource based on it's type
 * @param params {object}
 *  contentId {string} The resource identifier
 *  resourceType {string} The type of resource [mec, avail, artwork)
 * @returns {Promise<*>}
 */





async function find(params) {
    const { resourceId, resourceType } = params;

    const interfaces = {
        mec: async () => {
            try {
                return await io.XML(resourceId, xmlPath);
            } catch (err) {
                // Unless the error was the resource not being found, then log the output
                if (err.errno !== -4058) {
                    console.log(err);
                }
                throw new Error(err);
            }
        },
        artwork: async () => {
            try {
                return io.streamImage(resourceId, artworkPath);
            } catch (err) {
                // Unless the error was the resource not being found, then log the output
                if (err.errno !== -4058) {
                    console.log(err);
                }
                throw new Error(err);
            }
        },
        avail: () => {
        },
    };

    return interfaces[resourceType]();

    console.log(`Current Path: ${currentPath()}`);
    console.log(`Current Directory: ${currentDir}`);
    console.log(`__dirName: ${__dirname}`);


}

async function dir() {
    try {
        return await io.dir(xmlPath);
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    find,
    dir,
};
