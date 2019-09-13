/**
 * @module
 * @desc A set of functions to help lookup EIDR from the XML, to create mappings to parents id
 * create counts, etc.
 */

const path = require('path');
const fetch = require('node-fetch');
const convert = require('xml-js');
const io = require('./io');

// Base url for retrieving an EIDR record
const eidrBaseURL = 'https://resolve.eidr.org:443/EIDR/object/';
// Identify EIDR id in string
const eidrRegX = /([A-F0-9]{4}-){5}[A-Z0-9]/;
const eidrIdRegEx = /10\.5240\/([A-F0-9]{4}-){5}[A-Z0-9]/;
// A list of EIDR types, that will have potentially have a parent
const parentTypes = ['EditInfo', 'SeasonInfo', 'EpisodeInfo'];

// Fetch XML from the specified URL
async function fetchXML(url) {
    try {
        const response = await fetch(url);
        return response.text();
    } catch (err) {
        throw (err);
    }
}

// Load a file and extract it's contentId
async function getContentId(filename, resourceType = 'mec', database) {
    // Load the XML file data
    const xmlData = await database.find({ resourceId: filename, resourceType });
    const xmlId = xmlData.match(/ContentID="(.+?)">/); // Extract the contentId
    return xmlId !== null ? xmlId[1] : null;
}

// Lookup the parent id for an EIDR passed in
async function eidrParent(id) {
    const resolveURL = `${eidrBaseURL}${id}`;
    const eidrRecord = await fetchXML(resolveURL);

    // Convert XML to JSON
    const xmlConfig = {
        compact: true,
        elementNameFn: val => val.replace('md:', ''),
        alwaysChildren: true,
        ignoreComment: true,
    };
    return convert.xml2js(eidrRecord, xmlConfig);
}


async function resolveParent(eidrRecord) {
    // Make sure no badly formed records
    if (!eidrRecord.hasOwnProperty('FullMetadata')) {
        return {
            parentId: null,
            name: null,
            type: null,
        };
    }

    const parentField = eidrRecord.FullMetadata.ExtraObjectMetadata || null;
    let parentEidr = null;
    if (parentField !== undefined && parentField !== null) {

        const objectTypes = Object.keys(parentField);
        const hasParent = parentTypes.filter(p => objectTypes.includes(p));
        if (hasParent.length !== 0) {
            parentEidr = parentField[hasParent[0]].Parent._text;
            console.log(`ParentId: ${parentEidr}`);
            const parentRecord = await resolveParent(eidrParent(parentEidr));
            return parentRecord;
        }
    }

    parentEidr = eidrRecord.FullMetadata.BaseObjectData.ID._text;
    const parentType = eidrRecord.FullMetadata.BaseObjectData.ReferentType._text;
    const parentName = eidrRecord.FullMetadata.BaseObjectData.ResourceName._text || null;

    return { parentId: parentEidr, parentName, parentType };
}

// Could insert code here to try and lookup an EIDR from an alternate ID
async function lookupAltId(contentId) {
    if (typeof contentId === 'string') {
        const id = contentId.replace('urn:dece:cid:org:', '').split(':');
        const altId = (id[0] === 'WB' && id[1].includes('x')) ? (id[1].split('x'))[0] : id[1];
        const resolveURL = `${eidrBaseURL}?altId=${altId}`;
        console.log(`Looking up alternate - Org: ${id[0]}, id: ${altId}`);
        const eidrRecord = await fetchXML(resolveURL);

        // If a record was returned on a valid ID
        if (!eidrRecord.includes('bad id error')) {
            const eidr = eidrRecord.match(eidrIdRegEx);
            console.log(`Found EIDR for: ${contentId}  - ${eidr[0]}`);
            return eidr[0];
        }
    }
    return null;
}


/**
 * Lookup the EIDR records in the Ultraviolet directory
 * Establish the parent record for each of the sources
 * @returns {Promise<void>}
 */

async function uvMap(fileName, resourceType, database) {
    let mapping = null;
    const contentId = await getContentId(fileName, resourceType, database);
    if (contentId !== null) {
        mapping = {
            contentId,
            fileName,
            eidr: null,
            type: null,
            name: null,
        };

        const chkEidr = contentId.match(eidrRegX); // Does the contentId contain an EIDR

        // If not not an EIDR then check if an altId in EIDR, otherwise make it a full EIDR
        mapping.eidr = chkEidr === null ? await lookupAltId(contentId) : `10.5240/${chkEidr[0]}`;
        const { eidr } = mapping;

        // console.log(`${i} - Checking for EIDR: ${contentId}: ${uvFileMap.hasOwnProperty(eidr)}`);
        if (eidr !== null) {
            // Lookup the parent EIDR, it's name and type
            const parentEidr = await resolveParent(await eidrParent(eidr));
            Object.assign(mapping, parentEidr);
        }
    }
    return mapping;
}


/**
 * Create a mapping from examining all the files in a given directory
 * @param params
 * @param params.resourceType - {string}
 * @returns {Promise<*>}
 */
async function create(params) {
    const {
        resourceType,
        fileList,
        curFileMap,
        database,
    } = params;

    // A mapper for each type
    const mapType = {
        mec: async (fileName) => {
            const contentId = await getContentId(fileName, resourceType, database);
            return contentId === null ? null : { contentId, fileName };
        },
        mmc: async (fileName) => {
            const contentId = await getContentId(fileName, resourceType, database);
            return contentId === null ? null : { contentId, fileName };
        },
        uv: async (fileName) => {
            return uvMap(fileName, resourceType, database);
        },
        test: async (fileName) => {
            const contentId = await getContentId(fileName, resourceType, database);
            return contentId === null ? null : { contentId, fileName };
        },
    };

    // Loop through all files, and create the mapping for it
    for (let i = 0; i < fileList.length; i += 1) {
        const fileName = fileList[i];
        if (!curFileMap.hasOwnProperty(fileName)) {
            // If this file is not in the current map, then check it
            console.log(`${i} / ${fileList.length} Try to load ${fileName}`);
            try {
                const res = await mapType[resourceType](fileName);
                if (res !== null) curFileMap[fileName] = res;
            } catch (err) {
                console.log(err);
            }
        }
    }
    // Save out the new mappings for any re-loading
    const { fileName, filePath } = database.resourceMappings[resourceType];
    const fullPath = path.join(io.currentPath(), filePath, fileName);
    await io.saveJSON(fullPath, curFileMap);
    return curFileMap;
}

/**
 * Add a new resource with it's filename to the mapping table
 * @param params
 * @returns {Promise<void>}
 */
async function update(params) {
    const {
        resourceId,
        resourceType,
        fileName,
        database,
    } = params;

    const curMapping = database.resourceMappings[resourceType].mapping;
    const curFileMap = database.resourceMappings[resourceType].fileMap;
    curMapping[fileName] = {
        contentId: resourceId,
        fileName,
    };
    curFileMap[resourceId] = fileName;
}

/**
 * Remove a new resource with it's filename to the mapping table
 * @param params
 * @returns {Promise<void>}
 */
async function remove(params) {
    const {
        resourceId,
        resourceType,
        fileName,
        database,
    } = params;

    const curMapping = database.resourceMappings[resourceType].mapping;
    const curFileMap = database.resourceMappings[resourceType].fileMap;
    delete curMapping[fileName];
    delete curFileMap[resourceId];
}


module.exports = {
    create,
    update,
    remove,
};
