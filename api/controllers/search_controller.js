const titleSearch = require('../../services/search/title_search');

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
    return sendResult(params);
}


async function getSearch(req, res) {
    const { database } = this.dependencies;
    const params = {
        database,
        searchQuery: req.query.searchQuery,
        result: {},
        req,
        res,
    };
    return startSearch(params);
}

module.exports = {
    getSearch,
};
