/**
 * @module
 * @desc A set of methods to help with io, loading, saving, retrieving files
 * @type {module:fs}
 */

const fs = require('fs');
const path = require('path');

const currentDir = path.basename(__dirname);
const currentPath = () => __dirname.slice(0, __dirname.indexOf(currentDir) - 1);

/**
 * Delete a file in the directory
 * @param fileName {string} - The filename to be deleted
 * @param pathName {string} - Pathname of the target directory
 * @returns {Promise<unknown>}
 */
async function deleteFile(fileName, pathName = '') {
    const fullPath = path.join(pathName, fileName);
    return new Promise((resolve, reject) => {
        fs.unlink(fullPath, (err, items) => {
            if (err) {
                if (err.errno !== -4058) console.log(err); // Log unexpected errors
                reject(err);
            }
            resolve(items);
        });
    });
}

/**
 * Retrieve a list of files in the directory
 * @param pathName {string} - Pathname of the target directory
 * @returns {Promise<unknown>}
 */
async function directory(pathName = '') {
    const fullPath = pathName;
    console.log(`Scanning the dir: ${fullPath}`);
    return new Promise((resolve, reject) => {
        fs.readdir(fullPath, (err, items) => {
            if (err) {
                if (err.errno !== -4058) console.log(err); // Log unexpected errors
                reject(err);
            }
            resolve(items);
        });
    });
}

/**
 * Retrieve of list of files that match a search string (no wildcards)
 * @param pathName {string} - Pathname of target directory
 * @param searchTerm {string} - String that is partially contained in the filenames
 * @returns {Promise}
 * @resolve {array} - An array containing all filenames in the directory
 * @reject {boolean} - False indicating the directory was not found
 */
async function dirSearch(pathName, searchTerm) {
    const searchRegex = new RegExp(searchTerm);
    try {
        const allFiles = await directory(pathName);
        return allFiles.filter(f => f.match(searchRegex));
    } catch (err) {
        return false; // Presumes the directory was not found
    }
}

async function streamImage(fileName, pathName) {
    const fullPath = path.join(`${pathName}`, `${fileName}`);
    console.log(`Trying to stream ${fullPath}`);
    try {
        const stream = fs.createReadStream(fullPath);
        console.log('Created a stream');
        return stream;
    } catch (err) {
        console.log(err);
        throw (err);
    }
}


// Load an XML file
async function loadXML(fileName, pathName = '') {
    const fullPath = path.join(`${pathName}`, (fileName.endsWith('.xml') ? fileName : `${fileName}.xml`));
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', (err, res) => {
            if (err !== null) {
                reject(err);
            }
            resolve(res);
        });
    });
}

/**
 * Load a file from disc, and return it as JSON
 *
 * @param {string} filename - The filename of the file to load
 * @param {string} pathName - The full path of the file to load
 * @returns {Promise<*>}
 */
async function loadJSON(fileName, pathName = '') {
    const fullPath = path.join(pathName, (fileName.endsWith('.json') ? fileName : `${fileName}.json`));
    console.log(`Trying to load: ${fullPath}`);

    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', (err, res) => {
            if (err !== null) {
                console.log(err);
                reject(err);
            } else {
                resolve(JSON.parse(res));
            }
        });
    });
}

async function saveFile(pathName, content) {
    const fullPath = path.join(pathName);
    return new Promise((resolve, reject) => {
        fs.writeFile(fullPath, content, 'utf8', (err) => {
            if (err) reject(err);
            console.log(`File saved as: ${fullPath}`);
            resolve();
        });
    });
}

// Save an XML file to the logs
async function saveXML(fileName, content) {
    const pathName = fileName.endsWith('.xml') ? fileName : `${fileName}.xml`;
    return saveFile(pathName, content);
}

// Save a JSON file to the logs
async function saveJSON(fileName, obj) {
    const fullPath = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    const content = JSON.stringify(obj);
    return saveFile(fullPath, content);
}

async function loadCommonMetadata(contentId, pathName) {
    return loadXML(contentId, pathName);
}

module.exports = {
    currentPath,
    deleteFile,
    XML: loadCommonMetadata,
    dir: directory,
    dirSearch,
    streamImage,
    loadJSON,
    saveJSON,
    saveXML,
};
