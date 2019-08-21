const load = require('./loadfile');

async function find(contentId) {
    try {
        return await load.XML(contentId);
    } catch (err) {
        return false;
    }
}

module.exports = {
    find,
};
