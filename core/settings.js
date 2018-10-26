/**
 * @name Krin settings utils file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const fs = require('fs');

/**
 * Parse the config file and permit to access to the entire config file or to a specific key
 */
function settings() {
    try {
        var file = fs.readFileSync(__dirname + '/../config/krin.json');
        this.raw = JSON.parse(file);
    } catch(err) {
        if(err.code == 'ENOENT')
            console.error('Unable to open \'krin.json\'. Check if the file exists or if Krin have the permission to read it.');
        else if(err.name == "SyntaxError")
            console.error('Unable to read \'krin.json\' because the file is not a valid JSON file.');

        process.exit(1);
    }
}

/**
 * Return the value of specified key
 * @param {String} key
 * @returns an object or undefined if not exists.
 */
settings.prototype.get = function (key) {
    try {
        return this.raw[key];
    } catch(err) {
        return undefined;
    }
}

module.exports = new settings();