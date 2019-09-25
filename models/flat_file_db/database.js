/**
 * @module database/database
 * @desc An abstraction layer for saving a retrieving resources
 */

const path = require('path');
const io = require('../../helpers/io'); // File with various io handlers
const createMappings = require('./create_mappings');

// Build the correct path based on the resource type
function resourcePath(resourceType) {
    return this.resourceEndpoints[resourceType];
}

// Anything other then file not found, log the error
const wasFileNotFound = (err) => {
    if (err.errno !== -4058) console.log(err);
};

/**
 * Find and retrieve a resource based on it's resource id and resource type
 *
 * @params {object} params - Set of parameters associated with the query
 * @params {string} params.resourceId - The resource identifier
 * @params {string} params.resourceType - The type of resource [mec, avail, artwork)
 * @returns {Promise<*>}
 */
async function find(params) {
    const { resourceId, resourceType } = params;
    const { fileMap } = this.resourceMappings[resourceType];

    const loadXmlResource = async () => {
        const fileName = fileMap.hasOwnProperty(resourceId) ? fileMap[resourceId] : resourceId;
        return io.XML(fileName, resourcePath.call(this, resourceType));
    };

    const streamImage = async () => {
        const fileName = fileMap.hasOwnProperty(resourceId) ? fileMap[resourceId] : resourceId;
        console.log(fileName);
        return io.streamImage(fileName, resourcePath.call(this, resourceType));
    };

    const interfaces = {
        mec: loadXmlResource,
        mmc: loadXmlResource,
        artwork: streamImage,
        avail: () => {},
        uv: loadXmlResource,
        test: loadXmlResource,
    };

    try {
        return interfaces[resourceType]();
    } catch (err) {
        wasFileNotFound(err);
        console.log(`Problem loading a file: ${resourceId}`);
        throw new Error(err);
    }
}

/**
 * Save a resource, it's type will declare where to save it.
 *
 * @params {object} params - Set of parameters associated with the query
 * @params {string} params.resourceId - The resource identifier
 * @params {string} params.resourceType - The type of resource [mec, avail, artwork)
 * @returns {Promise<*>}
 */

async function save(params) {
    const {
        resourceId,
        resourceType,
        resource,
    } = params;
    let { fileName } = params;

    if (fileName === undefined) fileName = resourceId;

    const saveXML = async () => {
        const fullPath = `${resourcePath.call(this, resourceType)}/${fileName}`;
        await io.saveXML(fullPath, resource);
        await createMappings.update(params);
    };

    const interfaces = {
        mec: saveXML,
        mmc: saveXML,
        artwork: async () => {
        },
        avail: () => {
        },
        test: saveXML,
    };
    console.log(`Save the resource - ${resourceType}: ${resourceId}`);
    try {
        return interfaces[resourceType]();
    } catch (err) {
        console.log(err);
        throw (err);
    }
}

/**
 * Remove(delete) a resource
 *
 * @params {object} params - Set of parameters associated with the query
 * @params {string} params.resourceId - The resource identifier
 * @params {string} params.resourceType - The type of resource [mec, avail, artwork)
 * @returns {Promise<*>}
 */

async function remove(params) {
    const { resourceId, resourceType } = params;
    const { fileMap } = this.resourceMappings[resourceType];
    const fileName = fileMap.hasOwnProperty(resourceId) ? fileMap[resourceId] : resourceId;
    console.log(`Delete the following file: ${fileName}`);

    const interfaces = {
        mec: async () => {
            await io.deleteFile(fileName, resourcePath.call(this, resourceType));
            await createMappings.remove(params);
        },
        mmc: async () => {
            await io.deleteFile(fileName, resourcePath.call(this, resourceType));
            await createMappings.remove(params);
        },
        artwork: async () => {
        },
        avail: () => {
        },
        test: async () => {
            await io.deleteFile(fileName, resourcePath.call(this, resourceType));
            await createMappings.remove(params);
        },
    };

    console.log(`Delete the resource - ${resourceType}: ${resourceId}`);
    try {
        return interfaces[resourceType]();
    } catch (err) {
        console.log(err);
        throw (err);
    }
}

/**
 * Confirm whether a specific resource already exists
 * @params {object} params - Set of parameters associated with the query
 * @params {string} params.resourceId - The resource identifier
 * @params {string} params.resourceType - The type of resource [mec, avail, artwork)
 * @returns {Promise<void>}
 */
async function exists(params) {
    const { resourceType, resourceId } = params;
    return this.resourceMappings[resourceType].fileMap.hasOwnProperty(resourceId);
}

/**
 * Returns an array of the files for a particular resource
 * @params {object} params - Set of parameters associated with the query
 * @params {string} params.resourceType - The type of resource [mec, avail, artwork)
 * @returns {Promise<void>}
 */
async function dir(params) {
    const { resourceType } = params;
    const fullPath = resourcePath.call(this, resourceType);
    try {
        return await io.dir(fullPath);
    } catch (err) {
        console.log(err);
        throw (err);
    }
}

/**
 * Returns a total count of all the resource available fir resource type
 * @params {object} params - Set of parameters associated with the query
 * @params {string} params.resourceType - The type of resource [mec, avail, artwork)
 * @returns {Promise<void>}
 */
async function count(params) {
    const resourceList = await dir.call(this, params);
    return resourceList.length;
}

// Load a JSON file that contains the mappings filenames to the resource ID and other information about creative work
async function loadMapping(fileName, pathName) {
    // Load the file mappings for a resource type
    const fullPath = path.join(io.currentPath(), pathName);
    try {
        return await io.loadJSON(fileName, fullPath);
    } catch (err) {
        console.log('Mapping File Not Loaded');
        return {};
    }
}

// Create a mapping from a resourceId to the filename of that resource
function createFileMap(resourceType, resourceMappingFile) {
    const fileMap = {};
    const fileKeys = Object.keys(resourceMappingFile);
    fileKeys.forEach((key) => {
        const rMap = Array.isArray(resourceMappingFile[key]) ? resourceMappingFile[key] : [resourceMappingFile[key]];
        rMap.forEach((map) => {
            if (map.hasOwnProperty('contentId')) {
                fileMap[map.contentId] = map.fileName;
            }
        });
    });
    return fileMap;
}

/**
 * Create a new database object
 * @param dbConfig
 * @returns {Promise<*|{find: *, save: *, count: *, dir: *, remove: *}>}
 */

async function create(dbConfig) {
    let newDb = Object.create({
        find,
        save,
        remove,
        exists,
        dir,
        count,
    });

    newDb = Object.assign(newDb, dbConfig);

    // Setup the file mappings for each resource
    const resourceMap = newDb.resourceMappings;
    const resourceTypes = Object.keys(resourceMap);
    for (let i = 0; i < resourceTypes.length; i += 1) {
        // Load the current mapping file for a resource and create initial configurations
        try {
            const { fileName, filePath } = resourceMap[resourceTypes[i]];
            const resourceMappingFile = await loadMapping(fileName, filePath);
            resourceMap[resourceTypes[i]].fileMap = createFileMap(resourceTypes[i], resourceMappingFile);

            // Take the contents of the current directory, and double check the mappings are all up to date
            // const fileList = await newDb.dir({ resourceType: resourceTypes[i] });
            const fileList = await newDb.dir({ resourceType: resourceMap[resourceTypes[i]].sourceType });
            const mapParams = {
                database: newDb,
                resourceType: resourceTypes[i],
                fileList,
                curFileMap: resourceMappingFile,
            };
            // Update the mapping file, ensuring it is synced with current directory
            resourceMap[resourceTypes[i]].mapping = await createMappings.create(mapParams);
            // Update the file map as well
            resourceMap[resourceTypes[i]].fileMap = createFileMap(resourceTypes[i], resourceMap[resourceTypes[i]].mapping);
        } catch (err) {
            console.log(err);
        }
    }
    return newDb;
}

module.exports = {
    create,
    find,
    save,
    remove,
    dir,
    count,
};
