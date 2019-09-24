/**
 * @module
 * @desc A fuzzy search algorithm
 */

const fuzzyset = {};

// Dos this object have any property keys
const isEmptyObject = obj => Object.keys(obj).length === 0;

// Ensure this is a string and make it lower case
const _normalizeStr = (str) => {
    if (Object.prototype.toString.call(str) !== '[object String]') {
        throw 'Must use a string as argument to FuzzySet functions';
    }
    return str.trim()
        .toLowerCase();
};

// Sort array of results into descending order
const sortDescending = (a, b) => b[0] - a[0];

function levenshtein(str1, str2) {
    const current = [];
    let prev;
    let value;

    for (let i = 0; i <= str2.length; i += 1) {
        for (let j = 0; j <= str1.length; j += 1) {
            if (i && j) {
                if (str1.charAt(j - 1) === str2.charAt(i - 1)) {
                    value = prev;
                } else {
                    value = Math.min(current[j], current[j - 1], prev) + 1;
                }
            } else {
                value = i + j;
            }

            prev = current[j];
            current[j] = value;
        }
    }

    return current.pop();
}

// return an edit distance from 0 to 1
function _distance(str1, str2) {
    if (str1 === null && str2 === null) throw ('Trying to compare two null values');
    if (str1 === null || str2 === null) return 0;
    str1 = String(str1);
    str2 = String(str2);

    const distance = levenshtein(str1, str2);

    return str1.length > str2.length
        ? 1 - distance / str1.length
        : 1 - distance / str2.length;
}

const _nonWordRe = /[^a-zA-Z0-9\u00C0-\u00FF, ]+/g;

function _iterateGrams(value, gramSize) {
    const _gramSize = gramSize || 2;
    let simplified = `-${value.toLowerCase().replace(_nonWordRe, '')}-`;
    const lenDiff = _gramSize - simplified.length;
    const results = [];
    if (lenDiff > 0) {
        for (let i = 0; i < lenDiff; i += 1) {
            simplified += '-';
        }
    }
    for (let i = 0; i < simplified.length - _gramSize + 1; i += 1) {
        results.push(simplified.slice(i, i + _gramSize));
    }
    return results;
}

function _gramCounter(value, gramSize) {
    // return an object where key=gram, value=number of occurrences
    const _gramSize = gramSize || 2;
    const result = {};
    const grams = _iterateGrams(value, _gramSize);

    for (let i = 0; i < grams.length; i += 1) {
        result[grams[i]] = grams[i] in result
            ? result[grams[i]] + 1
            : 1;
    }
    return result;
}

// the main functions
fuzzyset.get = function get(value, defaultValue, minMatchScore) {
    // check for value in set, returning defaultValue or null if none found
    const _minMatchScore = minMatchScore || 0.33;
    const result = this._get(value, _minMatchScore);
    return (!result && typeof defaultValue !== 'undefined')
        ? defaultValue
        : result;
};

fuzzyset._get = function _get(value, minMatchScore) {
    const normalizedValue = _normalizeStr(value);
    const result = this.exactSet[normalizedValue];
    if (result) {
        return [[1, result]];
    }

    let results = [];
    // start with high gram size and if there are no results, go to lower gram sizes
    for (let gramSize = this.gramSizeUpper; gramSize >= this.gramSizeLower; gramSize -= 1) {
        results = this.__get(value, gramSize, minMatchScore);
        if (results && results.length > 0) {
            return results;
        }
    }
    return null;
};

fuzzyset.__get = function (value, gramSize, minMatchScore) {
    const normalizedValue = _normalizeStr(value);
    const matches = {};
    const gramCounts = _gramCounter(normalizedValue, gramSize);
    const items = this.items[gramSize];
    let sumOfSquareGramCounts = 0;
    let gram;
    let gramCount;

    for (gram in gramCounts) {
        gramCount = gramCounts[gram];
        sumOfSquareGramCounts += gramCount ** 2;
        if (gram in this.matchDict) {
            for (let i = 0; i < this.matchDict[gram].length; i += 1) {
                const index = this.matchDict[gram][i][0];
                const otherGramCount = this.matchDict[gram][i][1];
                matches[index] = index in matches
                    ? matches[index] += gramCount * otherGramCount
                    : gramCount * otherGramCount;
            }
        }
    }

    if (isEmptyObject(matches)) return null;

    const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
    let results = [];
    // build a results list of [score, str]
    Object.keys(matches).forEach((matchIndex) => {
        const matchScore = matches[matchIndex];
        results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
    });

    results.sort(sortDescending);

    if (this.useLevenshtein) {
        const newResults = [];
        const endIndex = Math.min(50, results.length);
        // truncate somewhat arbitrarily to 50
        for (let i = 0; i < endIndex; i += 1) {
            newResults.push([_distance(results[i][1], normalizedValue), results[i][1]]);
        }
        results = newResults.sort(sortDescending);
    }

    const newResults = [];
    results.forEach(function(scoreWordPair) {
        if (scoreWordPair[0] >= minMatchScore) {
            newResults.push([scoreWordPair[0], this.exactSet[scoreWordPair[1]]]);
        }
    }.bind(this));
    return newResults;
};

fuzzyset._add = function _add(value, gramSize) {
    const normalizedValue = _normalizeStr(value.string);
    const items = this.items[gramSize] || [];
    const index = items.length;

    items.push(0);
    const gramCounts = _gramCounter(normalizedValue, gramSize);
    let sumOfSquareGramCounts = 0;
    let gramCount;

    Object.keys(gramCounts).forEach((gram) => {
        gramCount = gramCounts[gram];
        sumOfSquareGramCounts += gramCount ** 2;
        if (gram in this.matchDict) {
            this.matchDict[gram].push([index, gramCount]);
        } else {
            this.matchDict[gram] = [[index, gramCount]];
        }
    });
    const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
    items[index] = [vectorNormal, normalizedValue];
    this.items[gramSize] = items;
    this.exactSet[normalizedValue] = value;
};

fuzzyset.add = function add(value) {
    if (value.string === null) return false;
    const normalizedValue = _normalizeStr(value.string);
    if (normalizedValue in this.exactSet) {
        return false;
    }

    let i = this.gramSizeLower;
    for (i; i < this.gramSizeUpper + 1; i += 1) {
        this._add(value, i);
    }
};

// return length of items in set
fuzzyset.length = function length() {
    return Object.keys(this.exactSet).length;
};

// return is set is empty
fuzzyset.isEmpty = function isEmpty() {
    return isEmptyObject(this.exactSet);
};

// return list of values loaded into set
fuzzyset.values = function values() {
    return Object.keys(this.exactSet);
};

module.exports = function FuzzySet(config) {
    const {
        arr,
        useLevenshtein,
        gramSizeLower,
        gramSizeUpper,
    } = config;

    const newFuzzy = Object.create(fuzzyset);
    newFuzzy.gramSizeLower = gramSizeLower || 2;
    newFuzzy.gramSizeUpper = gramSizeUpper || 3;
    newFuzzy.useLevenshtein = (typeof useLevenshtein !== 'boolean') ? true : useLevenshtein;

    // define all the object functions and attributes
    newFuzzy.exactSet = {};
    newFuzzy.matchDict = {};
    newFuzzy.items = {};

    // initialization
    let i = newFuzzy.gramSizeLower;
    for (i; i < newFuzzy.gramSizeUpper + 1; i += 1) {
        newFuzzy.items[i] = [];
    }
    // add all the items to the set
    for (i = 0; i < arr.length; i += 1) {
        if (arr[i] !== null) newFuzzy.add(arr[i]);
    }
    return newFuzzy;
};
