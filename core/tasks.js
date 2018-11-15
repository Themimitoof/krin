/**
 * @name Krin tasks file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const schedule = require('node-schedule'),
      fs       = require('fs'),
      db       = require('../db/models').sequelize,
      crypto   = require('crypto');


// Tasks
/**
 * Remove expired files from database and filesystem.
 */
function clean_expired() {
    const task  = 'clean_expired', 
          timer = Date.now();

    console.info(`${task} task started at ${new Date}`);

    // Get all expired medias
    db.models.files.findAll({
        where: {
            expireAt: { [db.Op.lte]: new Date() }
        }
    }).then(data => {
        if(data == null) {
            console.log('No expired files found in database. Nothing to do.');
            return return_exectime(task, timer);
        }

        data.forEach((file, it) => {
            fs.unlink(__dirname + `/../files/${file.owner}.${file.file}`, err => {
                const filename = `${file.dataValues.owner}.${file.dataValues.file}`;
                if(err) console.error(`Unable to delete the file in filesystem ${filename}. Cause: \n`, err.message);
                else {
                    data[it].destroy();
                    console.log(`${filename} deleted.`);
                }
            });
        });
        
        return return_exectime(task, timer);
    }).catch(err => {
        console.error('An error happened during the execution of the task. Cause:\n' + err);
        return return_exectime(task, timer);   
    });
}


/**
 * Remove all orphans files from database and filesystem.
 */
function clean_orphans() {

}


/**
 * Create new user
 * @param {Callback} cb
 */
function create_apikey(cb) {
    const api_key = crypto.randomBytes(64).toString('base64');
     db.models.users.create({api_key}).then(data => cb(null, data.dataValues)).catch(err => cb(err, null));
}


/**
 * Renew the API key of existing user
 * @param {UUID} uuid 
 * @returns generated API key
 */
function renew_apikey(uuid) {
    const api_key = crypto.randomBytes(64).toString('base64');

}

/**
 * Revoke the access to the servce to the specified used
 * @param {*} uuid 
 * @param {Boolean} status 
 */
function revoke_apikey(uuid, status) {

}

/**
 * Give admin rights to specified user (for the future)
 * @param {*} uuid 
 * @param {Boolean} status
 */
function give_superpowers(uuid, status) {

}


/**
 * Task callback
 * @callback Callback
 * @param {Object} error return an object of errors or null
 * @param {Object} result return the result or null
 */


/**
 * Print in the console, the processing time of the task.
 * @param {String} task_name
 * @param {Number} timer 
 */
function return_exectime(task_name, timer) {
    console.info(`${task_name} task executed in ${Date.now() - timer}ms.`);
}

// Scheduled tasks
schedule.scheduleJob('0 * * * *', () => clean_expired());
schedule.scheduleJob('0 * * * *', () => clean_orphans());


// Export tasks for manual commands
module.exports = {
    clean_expired,
    clean_orphans,
    create_apikey
}