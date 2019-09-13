const titleSearch = require('../../helpers/title_search');

const eidrMap = require('../../logs/uvFileMap');

// Create mapping of a parent ID to a sibling that we have a record for
const parentMap = {};
const eidrKeys = Object.keys(eidrMap);
eidrKeys.forEach((key) => {
    if (eidrMap[key].hasOwnProperty('parentEidr')) {
        parentMap[eidrMap[key].parentEidr] = key;
    }
});

async function sendResult(params) {
    const { res, result } = params;
    try {
        res.status(200)
           .type('application/json')
           .send(JSON.stringify(result));
    } catch (err) {
        res.status(404)
           .type('plain/text')
           .send('Resource not found');
    }
}

async function startSearch(params) {
    const { searchQuery } = params;
    const searchResult = titleSearch(searchQuery);
    params.result = searchResult;
    sendResult(params);
}


function getSearch(req, res) {
    const { database } = this.dependencies;
    const params = {
        database,
        searchQuery: req.query.searchQuery,
        result: {},
        req,
        res,
    };
    startSearch(params);
}

module.exports = {
    getSearch,
};
