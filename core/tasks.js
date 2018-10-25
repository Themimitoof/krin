/**
 * @name Krin tasks file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const schedule = require('node-schedule'),
      db       = require('../db/models').sequelize;


// Tasks

/**
 * 
 * @returns
 */
function clean_expired() {

}

function clean_orphans() {

}


// Scheduled tasks
schedule.scheduleJob('0 * * * *', clean_expired());
schedule.scheduleJob('0 * * * *', clean_orphans());


// Export tasks for manual commands
module.exports = {
    'clean_expired': clean_expired,
    'clean_orphans': clean_orphans
}