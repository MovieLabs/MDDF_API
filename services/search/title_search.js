/**
 * @module
 * @desc Initialize a search mechanism for locating titles by name
 */


const eidrMap = require('../../logs/uvFileMap');
const fuzzySet = require('./fuzzy_set');

console.log('Indexing search');
const keys = Object.keys(eidrMap);
const titleNames = [];
for (let i = 0; i < keys.length; i += 1) {
    if (eidrMap[keys[i]].hasOwnProperty('parentName')) {
        // console.log(`${i}: ${eidrMap[key].parentName}`);
        titleNames.push({
            string: eidrMap[keys[i]].parentName,
            data: keys[i],
        });
    }
}

console.log(`How many titles: ${titleNames.length}`);

const config = {
    arr: titleNames,
    useLevenshtein: false,
    gramSizeLower: 2,
    gramSizeUpper: 3,
};

const titleSearch = fuzzySet(config);

module.exports = function search(searchQuery) {
    const fuzzyMatch = titleSearch.get(searchQuery, null, 0.33);

    return fuzzyMatch.map(res => (
        {
            score: res[0],
            name: eidrMap[res[1].data].parentName,
            contentId: eidrMap[res[1].data].contentId,
            type: eidrMap[res[1].data].parentType,
            fileName: eidrMap[res[1].data].fileName,
            parentEidr: eidrMap[res[1].data].parentEidr || 'N/A',
        }
    ));
};
