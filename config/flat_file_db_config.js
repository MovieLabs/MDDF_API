/**
 * @module
 * @desc A configuration object, including all the process.env variables
 */

module.exports = {
    resourceEndpoints: {
        mec: process.env.MEC_PATH,
        mmc: process.env.MMC_PATH,
        artwork: process.env.ARTWORK_PATH,
        avails: process.env.AVAILS_PATH,
        uv: process.env.UV_PATH,
        test: process.env.TEST_PATH,
    },
    resourceMappings: {
        mec: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'mecMap',
            sourceType: 'mec',
            mapping: {},
        },
        mmc: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'mmcMap',
            sourceType: 'mmc',
            mapping: {},
        },
        artwork: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'artworkMap',
            sourceType: 'mec',
            mapping: {},
        },
        uv: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'uvFileMap',
            sourceType: 'uv',
            mapping: {},
        },
        test: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'testMap',
            sourceType: 'test',
            mapping: {},
        },
    },
};
