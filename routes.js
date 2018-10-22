/**
 * @name Krin routes file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const route = require('express').Router(),
      db    = require('./db/models').sequelize;


// Define some constants
const HTTP_CODE = {
    OK: 200,
    CREATED: 201,
    BADREQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    INTERROR: 500
};

const ERR_MESSAGES = {
    NOT_FOUND: 'Ressource not found.',
    INT_ERROR: 'Internal error.',
    NO_VALID_API_KEY: 'A valid API key is needed to use this endpoint.',
    BLOCKED_ACCOUNT: 'Your account is currently blocked.'
}


/**
 * Return to the client with the good content-type
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {HTTP_CODE} err_code 
 * @param {ERR_MESSAGES} message 
 */
function return_err_message(req, res, err_code, message) {
    if(req.headers["content-type"] == 'application/json')
        res.status(err_code).json({
            code: err_code,
            message: message
        });
    else res.status(err_code).send(message);

    res.end();
}


/**
 * Validate the user token and if is authorized to connect
 * @param {Express.Request} req 
 * @param {Express.Response} res
 * @param {Object} next 
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


// Retrieve the list of user files
route.get('/files', validate_authentication, (req, res) => {
    db.models.files.findAll({
        owner: req.user.uuid,
        where: {
            // TODO: Need to work later
            // expireAt: {
            //     [db.Op.lt]: new Date()
            // }
        },
        raw: true
    }).then(val => {
        res.status(HTTP_CODE.OK).json(val);
    }).catch(() => return_err_message(req, res, HTTP_CODE.INTERROR, ERR_MESSAGES.INT_ERROR));
});

// Post file
route.post('/file', validate_authentication, (req, res) => {
    res.send('yo');
});

// Get file
route.get('/file/:uuid', (req, res) => {
    res.send('hello');
});

// Delete file
route.delete('/file/:uuid', validate_authentication, (req, res) => {
    res.send('hello');
});

// 404 error
route.use((req, res) => return_err_message(req, res, HTTP_CODE.NOTFOUND, ERR_MESSAGES.NOT_FOUND));

module.exports = route;