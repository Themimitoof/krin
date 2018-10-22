/**
 * @name Krin
 * @description Share instantaneously files and pictures
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const express = require('express'),
      bodyParser = require('body-parser');

const app     = express();
const env     = process.env.NODE_ENV || 'development';

// Web server constants
const HTTP_BIND = process.env.HTTP_BIND || 'localhost';
const HTTP_PORT = process.env.HTTP_PORT || 8095;

console.info(`Running Krin in ${env} mode`);

// Configure express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.disable('X-Powered-By'); // Remove Express header
app.use('/', require('./routes'));

// Start web server
app.listen(HTTP_PORT, HTTP_BIND, () => {
    console.info(`Krin server is listening in http://${HTTP_BIND}:${HTTP_PORT}/.`);
});