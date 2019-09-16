/**
 * @module
 * @desc Loads and runs the init method for the loaders
 */

const init = require('./init_loader');

module.exports = {
    init: async depend => init(depend),
};
