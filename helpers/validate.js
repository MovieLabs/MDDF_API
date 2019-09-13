/**
 * @module
 * @desc Validate data before saving it
 */

function mec(xmlData) {
    const xmlId = xmlData.match(/ContentID="(.+?)">/); // Extract the contentId
    return xmlId !== null ? xmlId[1] : null;
}

function mmc(xmlData) {
    const xmlId = xmlData.match(/ContentID="(.+?)">/); // Extract the contentId
    return xmlId !== null ? xmlId[1] : null;
}

function avails(xmlData) {
    return null;
}

function artwork(xmlData) {
    return null;
}

function test(xmlData) {
    const xmlId = xmlData.match(/ContentID="(.+?)">/); // Extract the contentId
    return xmlId !== null ? xmlId[1] : null;
}

module.exports = {
    mec,
    mmc,
    avails,
    artwork,
    test,
};