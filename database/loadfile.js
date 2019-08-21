
const fs = require('fs');
const path = require('path');

const currentDir = path.basename(__dirname);

function currentPath() {
    return __dirname.slice(0, __dirname.indexOf(currentDir) - 1);
}

async function directory(pathName = '') {
    const fullPath = path.join(currentPath(), pathName);

    return new Promise((resolve, reject) => {
        fs.readdir(fullPath, (err, items) => {
            console.log(items);
            resolve(items);
        });
    });
}


// Load a JSON file
async function loadXML(filename, pathName = '') {
    const fullPath = path.join(currentPath(), pathName, `${filename}.xml`);

    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', (err, res) => {
            if (err !== null) reject(err);
            resolve(res);
        });
    });
}

// Save a JSON file to the logs
async function saveJSON(fileName, obj) {
    const dir = './sample_data/common_metadata';
    const fullPath = `${dir}/${fileName}.json`;
    const content = JSON.stringify(obj);

    fs.writeFile(fullPath, content, 'utf8', (err) => {
        if (err) {
            return console.error(err);
        }
        console.log(`Log file saved as: ${fullPath}`);
        return true;
    });
}

async function loadCommonMetadata(contentId) {
    const dir = 'sample_data/common_metadata';
    return loadXML(contentId, dir);
}

module.exports = {
    XML: loadCommonMetadata,
};
