

const eidrMap = require('../logs/eidrMap');
const fuzzySet = require('./fuzzy_set');

const keys = Object.keys(eidrMap);
const titleNames = keys.map(key => ({ string: eidrMap[key].name, data: key }));

console.log(`How many titles: ${titleNames.length}`);

const config = {
    arr: titleNames,
    useLevenshtein: false,
    gramSizeLower: 2,
    gramSizeUpper: 3,
};
const titleSearch = fuzzySet(config);

module.exports = function(searchQuery) {
    const fuzzyMatch = titleSearch.get(searchQuery, null, 0.33);

    const fuzzyMatchFormatted = fuzzyMatch.map((res) => {
        return {
            score: res[0],
            contentId: res[1].data,
            title: eidrMap[res[1].data],
        };
    });
    return fuzzyMatchFormatted;
};
