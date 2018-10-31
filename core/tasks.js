/**
 * @name Krin tasks file
 * @author Michael Vieira
 * @version 0.1.0
 * @license MIT
 */

// Import dependencies
const schedule = require('node-schedule'),
      fs       = require('fs'),
      db       = require('../db/models').sequelize;


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
    'clean_expired': clean_expired,
    'clean_orphans': clean_orphans
}