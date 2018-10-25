/**
 * @name Krin
 * @description Share instantaneously files and pictures
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const server  = require('http'),
      router  = require('./core/router'),
      env     = process.env.NODE_ENV || 'development';

// Web server constants
const HTTP_BIND = process.env.HTTP_BIND || 'localhost';
const HTTP_PORT = process.env.HTTP_PORT || 8095;

console.info(`Running Krin in ${env} mode`);

// Create the server
server.createServer(router).listen(HTTP_PORT, HTTP_BIND, () => {
    console.info(`Krin server is listening in http://${HTTP_BIND}:${HTTP_PORT}/.`);
});