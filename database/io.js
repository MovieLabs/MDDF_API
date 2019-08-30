
const fs = require('fs');
const path = require('path');

const currentDir = path.basename(__dirname);

function currentPath() {
    return __dirname.slice(0, __dirname.indexOf(currentDir) - 1);
}

async function directory(pathName = '') {
    // const fullPath = path.join(currentPath(), pathName);
    const fullPath = pathName;

    return new Promise((resolve, reject) => {
        fs.readdir(fullPath, (err, items) => {
            resolve(items);
        });
    });
}

async function streamImage(fileName, pathName) {
    const fullPath = path.join(`${pathName}`, `${fileName}.png`);
    console.log(`Trying to stream ${fullPath}`);
    const stream = fs.createReadStream(fullPath);
    return stream;
}


// Load an XML file
async function loadXML(fileName, pathName = '') {
    const fullPath = path.join(`${pathName}`, `${fileName}.xml`);
    console.log(`Trying to load: ${fullPath}`);

    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', (err, res) => {
            if (err !== null) {
                // console.log(err);
                reject(err);
            }
            resolve(res);
        });
    });
}

// Load an XML file
async function loadJSON(filename, pathName = '') {
    const fullPath = path.join(`${pathName}`, `${filename}.json`);
    console.log(`Trying to load: ${fullPath}`);

    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', (err, res) => {
            if (err !== null) {
                reject(err);
            } else {
                resolve(JSON.parse(res));
            }
        });
    });
}

// Save a JSON file to the logs
async function saveJSON(fileName, obj) {
    // const dir = './sample_data/common_metadata';
    const fullPath = `${fileName}.json`;
    const content = JSON.stringify(obj);

    fs.writeFile(fullPath, content, 'utf8', (err) => {
        if (err) {
            return console.error(err);
        }
        console.log(`Log file saved as: ${fullPath}`);
        return true;
    });
}

async function loadCommonMetadata(contentId, path) {
    return loadXML(contentId, path);
}

module.exports = {
    XML: loadCommonMetadata,
    dir: directory,
    streamImage,
    loadJSON,
    saveJSON,
};
