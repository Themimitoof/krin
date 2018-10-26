/**
 * @name Krin router file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const pathRegexp = require('path-to-regexp'),
      fileType   = require('file-type'),
      fs         = require('fs'),
      crypto     = require('crypto'),
      db         = require('../db/models').sequelize;

var config = {};
config.max_size = "400000000";

// Define some constants
const HTTP_CODE = {
    OK: 200,
    CREATED: 201,
    BADREQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    TOOLARGE: 413,
    UNP_ENTITY: 422,
    INTERROR: 500
};

const RETURN_MESSAGES = {
    NOT_FOUND: 'Ressource not found.',
    INT_ERROR: 'Internal error.',
    TOO_LARGE: 'The file exceed the maximum size allowed.',
    NO_VALID_API_KEY: 'A valid API key is needed to use this endpoint.',
    BLOCKED_ACCOUNT: 'Your account is currently blocked.',
    UPLOAD_EMPTY: 'The uploaded ressource is empty.',
    DELETED: 'File deleted.'
}


function router(req, res) {
    res.setHeader('X-Powered-By', 'Krin'); // Add X-Powered-By header

    // Retrieve user's files
    if(req.method == "GET" && req.url === '/files') {
        validate_authentication(req, res, () => {
            db.models.files.findAll({
                where: { owner: req.user.uuid },
                raw: true
            }).then(data => {
                res.writeHead(HTTP_CODE.OK, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            }).catch(() => return_message(req, res, HTTP_CODE.INTERROR, RETURN_MESSAGES.INT_ERROR));
        });
    }

    // Post new file
    else if(req.method == "POST" && req.url === '/files') {
        req.body = [];
        req.payload_size = 0;

        validate_authentication(req, res, () => {
            // Retrieve data
            req.on('data', chunk => {
                req.body.push(chunk);
                req.payload_size += chunk.length;

                if(req.payload_size > config.max_size)
                    return_message(req, res, HTTP_CODE.TOOLARGE, RETURN_MESSAGES.TOO_LARGE);
            });

            // Store the file and respond to the client
            req.on('end', () => {
                req.body = Buffer.concat(req.body);
                var file_infos = fileType(req.body);
                var filename = crypto.randomBytes(16).toString('hex');

                if(file_infos != null) filename += '.' + file_infos.ext;

                // Check if the file is empty
                if(req.body.length == 0)
                    return return_message(req, res, HTTP_CODE.UNP_ENTITY, RETURN_MESSAGES.UPLOAD_EMPTY);

                // Write the file
                fs.writeFile(__dirname + `/../files/${req.user.uuid}-${filename}`, req.body, err => {
                    if(err) {
                        console.error('Unable to store the file for ' + req.user.uuid +'. Cause: \n', err.message);
                        return return_message(req, res, HTTP_CODE.INTERROR, RETURN_MESSAGES.INT_ERROR);
                    }

                    // Store the filename and is owner in the database
                    db.models.files.create({
                        file: filename,
                        owner: req.user.uuid
                    })
                    .then(() => return_message(req, res, HTTP_CODE.OK, global.BASE_URL + 'files/' + filename))
                    .catch(dbErr => {
                        console.error('[!Orphan file created!] Unable to store the file in database for ' + req.user.uuid +'. Cause: \n', dbErr.message);
                        return_message(req, res, HTTP_CODE.INTERROR, RETURN_MESSAGES.INT_ERROR)
                    });
                });
            });
        });
    }

    // Retrieve requested file
    else if(req.method == "GET" && pathRegexp('/files/:filename').exec(req.url)) {
        var filename = pathRegexp('/files/:filename').exec(req.url)[1];
        
        // Check if the file exists in database
        db.models.files.findOne({
            where: { file: filename },
            raw: true
        }).then(data => {
            if(data == null)
                return return_message(req, res, HTTP_CODE.NOTFOUND, RETURN_MESSAGES.NOT_FOUND);

            fs.readFile(__dirname + `/../files/${data.owner}-${filename}`, (err, file) => {
                if(err)
                    return return_message(req, res, HTTP_CODE.NOTFOUND, RETURN_MESSAGES.NOT_FOUND);

                res.writeHead(HTTP_CODE.OK);
                res.end(file);
            });
        }).catch(() => return_message(req, res, HTTP_CODE.INTERROR, RETURN_MESSAGES.INT_ERROR));
    }


    // Delete requested file
    else if(req.method == "DELETE" && pathRegexp('/files/:filename').exec(req.url)) {
        var filename = pathRegexp('/files/:filename').exec(req.url)[1];

        validate_authentication(req, res, () => {
            db.models.files.findOne({
                where: { file: filename }
            }).then(model => {
                var infos = (model != null) ? model.dataValues : null;

                if(model != null) model.destroy();
                return infos;
            }).then(infos => {
                if(infos) {
                    fs.unlink(__dirname + `/../files/${infos.owner}-${filename}`, err => {
                        if(err)
                            console.error(`[!Possible orphan file created!] Unable to delete the file in filesystem ${infos.owner}-${filename}. Cause: \n`, err.message);

                        return_message(req, res, HTTP_CODE.OK, RETURN_MESSAGES.DELETED);
                    });
                } else return_message(req, res, HTTP_CODE.NOTFOUND, RETURN_MESSAGES.NOT_FOUND);
            }).catch((err) => return_message(req, res, HTTP_CODE.INTERROR, RETURN_MESSAGES.INT_ERROR));
        });
    }

    // Return error 404 if the route not exists
    else return_message(req, res, HTTP_CODE.NOTFOUND, RETURN_MESSAGES.NOT_FOUND);
}

/**
 * Validate the user token and if is authorized to connect
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
function validate_authentication(req, res, next) {
    var api_key = req.headers['x-api-key'];
    req.api_key = api_key;

    if(typeof api_key !== 'undefined' && api_key.length == 64) {
        db.models.users.findOne({
            api_key,
            where: {},
            raw: true
        }).then(val => {
            if(val === null) return_message(req, res, HTTP_CODE.UNAUTHORIZED, RETURN_MESSAGES.NO_VALID_API_KEY);
            else if(val.blocked == true) return_message(req, res, HTTP_CODE.FORBIDDEN, RETURN_MESSAGES.BLOCKED_ACCOUNT);
            else {
                req.user = val;
                next();
            }
        }).catch(() => return_message(req, res, HTTP_CODE.INTERROR, RETURN_MESSAGES.INT_ERROR));
    } else return_message(req, res, HTTP_CODE.UNAUTHORIZED, RETURN_MESSAGES.NO_VALID_API_KEY);
};


/**
 * Return to the client with the good content-type
 * @param {Request} req
 * @param {Response} res
 * @param {HTTP_CODE} http_code
 * @param {RETURN_MESSAGES} message
 */
function return_message(req, res, http_code, message) {
    if(req.headers["content-type"] == 'application/json') {
        res.writeHead(http_code, { 'Content-Type': 'application/json' });
        message = JSON.stringify({ code: http_code, message: message });
    } else res.writeHead(http_code);

    res.end(message, () => req.connection.destroy());
}

module.exports = router;