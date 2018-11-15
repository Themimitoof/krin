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
    const task  = 'clean_orphans', 
          timer = Date.now();

    // Get all expired medias
    db.models.files.findAll({ where: {} }).then(data => {
        if(data == null) {
            console.log('No files found in database. Nothing to do.');
            return return_exectime(task, timer);
        }

        console.log('Delete orphans files in database.');
        for(i = 0; i <= data.length; i++) {
            if(!fs.existsSync(__dirname + `/../files/${data[i].owner}.${data[i].file}`)) {
                const file_uuid = data[i].uuid;

                data[i].destroy();
                console.log(`${file_uuid} entry deleted.`);
            }
        }

        console.log('Delete orphans files in filesystem.');
        fs.readdir(__dirname + '/../files/', (err, files) => {
            if(err) {
                console.log('An error is occured on opening the folder. Cause: \n' + err);
                return return_exectime(task, timer);
            }

            for(i = 0; i <= files.length; i++) {
                var file_found = false, x = 0;

                for(x = 0; x <= data.length; x++) {
                    if(data[x].file == files[i]) {
                        file_found = true;
                        break;
                    }
                }

                if(!file_found) {
                    var filename = files[i];

                    if(!fs.unlinkSync(__dirname + `/../files/${filename}`))
                        console.log(`${filename} deleted.`);
                    else
                        console.warn(`Unable to delete ${filename}!`);
                }
            }

            return return_exectime(task, timer);
        });
    }).catch(err => {
        console.error('An error happened during the execution of the task. Cause:\n' + err);
        return return_exectime(task, timer);   
    });

    console.info(`${task} task started at ${new Date}`);
}


/**
 * Create new user
 * @param {Callback} cb
 */
function create_apikey(cb) {
    const api_key = crypto.randomBytes(32).toString('hex');
    
    db.models.users.create({api_key}).then(data => cb(null, data.dataValues)).catch(err => cb(err, null));
}


/**
 * Renew the API key of existing user
 * @param {UUID} uuid user uuid
 * @param {Callback} cb
 */
function renew_apikey(uuid, cb) {
    const api_key = crypto.randomBytes(32).toString('hex');

    db.models.users.findByPk(uuid).then(user => {
        if(user == undefined)
            return cb('Non existing user.', null);

        // Change API Key
        user.api_key = api_key;

        // Save the instance
        user.save({fields: ['api_key']}).then(res => cb(null, res.dataValues));
    }).catch(err => cb(err, null));
}

/**
 * Revoke the access to the servce to the specified used
 * @param {*} uuid user uuid
 * @param {Boolean} status desired status
 * @param {Callback} cb 
 */
function revoke_apikey(uuid, status, cb) {
    db.models.users.findByPk(uuid).then(user => {
        if(user == undefined)
            return cb('Non existing user.', null);

        // Change status
        user.blocked = status;

        // Save the instance
        user.save({fields: ['blocked']}).then(res => cb(null, res.dataValues));
    }).catch(err => cb(err, null));
}

/**
 * Give admin rights to specified user (for the future)
 * @param {*} uuid user uuid
 * @param {Boolean} status desired status
 * @param {Callback} cb 
 */
function give_superpowers(uuid, status, cb) {
    db.models.users.findByPk(uuid).then(user => {
        if(user == undefined)
            return cb('Non existing user.', null);

        // Change status
        user.admin = status;

        // Save the instance
        user.save({fields: ['admin']}).then(res => cb(null, res.dataValues));
    }).catch(err => cb(err, null));
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
    create_apikey,
    renew_apikey,
    revoke_apikey,
    give_superpowers
}