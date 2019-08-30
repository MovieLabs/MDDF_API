/**
 * Create an index of all MEC resources from their filenames
 * Lookup the parent EIDR so that it can be mapped when a parent ID is used
 * @type {any}
 */

const fetch = require('node-fetch');
const convert = require('xml-js');
const path = require('path');
const io = require('./io');
const database = require('./database');

const eidrBaseURL = 'https://resolve.eidr.org:443/EIDR/object/';

// Load any saved mappings so they don't have to be done again
async function loadEidrMap() {
    const filePath = path.join(currentPath(), 'logs/eidrMap');
    try {
        const testJSON = await io.loadJSON(filePath);
        return testJSON;
    } catch (err) {
        if (err.errno === -4058) return {}; // If file not found, initiate to empty object
        console.log(err);
        return false;
    }
}

const currentDir = path.basename(__dirname);

function currentPath() {
    return __dirname.slice(0, __dirname.indexOf(currentDir) - 1);
}

async function fetchXML(url) {
    try {
        const response = await fetch(url);
        return response.text();
    } catch (err) {
        throw (err);
    }
}


const EidrRegX = /([A-F0-9]{4}-){5}[A-Z0-9]/;

async function getEIDR() {
    const cat = await database.dir();
    const eidr = [];
    cat.forEach((fileName) => {
        const isEidr = fileName.match(EidrRegX);
        if (isEidr !== null) eidr.push({
            contentId: fileName,
            eidr: `10.5240/${isEidr[0]}`,
        });
    });

    console.log(`Found ${cat.length} files`);
    console.log(`Total ${eidr.length} EIDR Id's`);

    return eidr;
}


async function eidrParent(id) {
    const resolveURL = `${eidrBaseURL}${id}`;
    const eidrRecord = await fetchXML(resolveURL);

    const xmlConfig = {
        compact: true,
        elementNameFn: val => val.replace('md:', ''),
        alwaysChildren: true,
        ignoreComment: true,
    };
    return convert.xml2js(eidrRecord, xmlConfig);
}

const parentTypes = ['EditInfo', 'SeasonInfo', 'EpisodeInfo'];

async function createLookup(eidrRecord) {
    // Make sure no badly formed records
    if (!eidrRecord.hasOwnProperty('FullMetadata')) {
        return {
            parentId: null,
            name: null,
            type: null,
        };
    }

    const parentField = eidrRecord.FullMetadata.ExtraObjectMetadata || null;
    let parentId = null;
    if (parentField !== undefined && parentField !== null) {

        const objectTypes = Object.keys(parentField);
        const hasParent = parentTypes.filter(p => objectTypes.includes(p));
        if (hasParent.length !== 0) {
            parentId = parentField[hasParent[0]].Parent._text;
            console.log(`ParentId: ${parentId}`);
            const parentRecord = await eidrParent(parentId);
            return createLookup(parentRecord);
        }
    }

    parentId = eidrRecord.FullMetadata.BaseObjectData.ID._text;
    const type = eidrRecord.FullMetadata.BaseObjectData.ReferentType._text;
    const name = eidrRecord.FullMetadata.BaseObjectData.ResourceName._text || null;

    return {parentId, name, type};
}


async function lookupEIDR() {
    const eidrLookupMap = await loadEidrMap() || {};

    const eidrList = await getEIDR();
    const filePath = path.join(currentPath(), 'logs/eidrMap');
    console.log ('Loaded stuff');
    // if (eidrList.length > 20) eidrList.length = 20;

    for (let i = 0; i < eidrList.length; i += 1) {
        const eidr = eidrList[i].eidr;
        // If we have not already resolved this EIDR then look it up, otherwise skip.
        if (!eidrLookupMap.hasOwnProperty(eidr)) {
            console.log(`Checking EIDR: ${eidr}`);
            const eidrRecord = await eidrParent(eidr);
            const parentRecord = await createLookup(eidrRecord);
            parentRecord.contentId = eidrList[i].contentId.replace('.xml', '');
            console.log(`${i} - ${parentRecord.type}: Parent EIDR: ${parentRecord.parentId}, name: ${parentRecord.name}`);
            console.log();
            eidrLookupMap[eidrList[i].eidr] = parentRecord;
        } else if (!eidrLookupMap[eidr].hasOwnProperty('contentId')) {
            eidrLookupMap[eidr].contentId = eidrList[i].contentId;
        }

        if (i % 100 === 0) {
            io.saveJSON(filePath, eidrLookupMap);
        }
    }
    io.saveJSON(filePath, eidrLookupMap);
}

module.exports = lookupEIDR;
