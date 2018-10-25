/**
 * @name Krin router file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const pathRegexp = require('path-to-regexp'),
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
    INTERROR: 500
};

const ERR_MESSAGES = {
    NOT_FOUND: 'Ressource not found.',
    INT_ERROR: 'Internal error.',
    TOO_LARGE: 'The file exceed the maximum size allowed.',
    NO_VALID_API_KEY: 'A valid API key is needed to use this endpoint.',
    BLOCKED_ACCOUNT: 'Your account is currently blocked.'
}


function router(req, res) {
    res.setHeader('X-Powered-By', 'Krin'); // Add X-Powered-By header

    // Retrieve user's files
    if(req.method == "GET" && req.url === '/files') {
        validate_authentication(req, res, () => {
            res.writeHead(HTTP_CODE.OK, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({
                code: HTTP_CODE.OK,
                message: "hello"
            }));

            res.end();
        }); 
    } 

    // Post new file
    else if(req.method == "POST" && req.url === '/files') {
        validate_authentication(req, res, () => {
            res.writeHead(HTTP_CODE.OK, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({
                code: HTTP_CODE.OK,
                message: "hello"
            }));

            res.end();
        }); 
    }
    
    // Retrieve requested file
    else if(req.method == "GET" && pathRegexp('/files/:uuid').exec(req.url)) {
        res.writeHead(HTTP_CODE.OK, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            code: HTTP_CODE.OK,
            message: "hello"
        }));

        res.end();
    }
    

    // Delete requested file
    else if(req.method == "DELETE" && pathRegexp('/files/:uuid').exec(req.url)) {
        validate_authentication(req, res, () => {
            res.writeHead(HTTP_CODE.OK, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({
                code: HTTP_CODE.OK,
                message: "hello"
            }));

            res.end();
        }); 
    }

    // Return error 404 if the route not exists
    else return_err_message(req, res, HTTP_CODE.NOTFOUND, ERR_MESSAGES.NOT_FOUND);

    req.body = [];
    req.payload_size = 0;

    // // Retrieve data
    // req.on('data', chunk => {
    //     req.body.push(chunk);
    //     req.payload_size += chunk.length;

    //     if(req.payload_size > config.max_size)
    //         return return_err_message(req, res, HTTP_CODE.TOOLARGE, ERR_MESSAGES.TOO_LARGE);
    // });


    // // Routes
    // req.on('end', () => {
    //     console.log(req.body);
    // });
    

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
            if(val === null) return_err_message(req, res, HTTP_CODE.UNAUTHORIZED, ERR_MESSAGES.NO_VALID_API_KEY);
            else if(val.blocked == true) return_err_message(req, res, HTTP_CODE.FORBIDDEN, ERR_MESSAGES.BLOCKED_ACCOUNT);
            else {
                req.user = val;
                next();
            }
        }).catch(() => { return_err_message(req, res, HTTP_CODE.UNAUTHORIZED, ERR_MESSAGES.NO_VALID_API_KEY) });
    } else return_err_message(req, res, HTTP_CODE.UNAUTHORIZED, ERR_MESSAGES.NO_VALID_API_KEY);
};


/**
 * Return to the client with the good content-type
 * @param {Request} req 
 * @param {Response} res 
 * @param {HTTP_CODE} err_code 
 * @param {ERR_MESSAGES} message 
 */
function return_err_message(req, res, err_code, message) {
    if(req.headers["content-type"] == 'application/json') {
        res.writeHead(err_code, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ code: err_code, message: message }));
    } else {
        res.writeHead(err_code);
        res.write(message);
    }

    res.end();
}

module.exports = router;