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
        uv: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'uvFileMap',
            mapping: {},
        },
        mec: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'mecMap',
            mapping: {},
        },
        mmc: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'mmcMap',
            mapping: {},
        },
//            artwork: {
//                filePath: 'models/flat_file_db/file_maps',
//                fileName: 'artworkMap',
//                mapping: {},
//            },
        test: {
            filePath: 'models/flat_file_db/file_maps',
            fileName: 'testMap',
            mapping: {},
        },
    },
};
