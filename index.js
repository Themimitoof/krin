/**
 * @name Krin
 * @description Share instantaneously files and pictures
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const conf    = require('./core/settings'),
      server  = require('http'),
      router  = require('./core/router'),
      exec    = require('child_process').exec;
      env     = process.env.NODE_ENV || 'development';

// Web server constants
const HTTP_BIND = process.env.HTTP_BIND || conf.get('bind_host') || 'localhost';
const HTTP_PORT = process.env.HTTP_PORT || conf.get('bind_port') || 8095;
global.BASE_URL = conf.get('base_url');
global.MAX_UPLOAD = process.env.MAX_UPLOAD || conf.get('max_upload') || 20000;
global.MAX_UPLOAD *= 1000;

console.info(`Running Krin in ${env} mode`);

// Run migrations
console.log('Try to run migrations script');
exec('node_modules/.bin/sequelize db:migrate', (err, out) => {
    if(err) {
        console.error('An error occurred when running the migration script. Cause:\n', err);
        process.exit(1);
    }

    // Remove the header of Sequelize-cli and show the rest
    out = out.split('\n');
    out.splice(0, 5);
    console.info(out.toString());

    // Import tasks
    require('./core/tasks');

    // Create the server
    server.createServer(router).listen(HTTP_PORT, HTTP_BIND, () => {
        console.info(`Krin server is listening in http://${HTTP_BIND}:${HTTP_PORT}/.`);
    });
});