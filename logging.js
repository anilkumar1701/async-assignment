var debugging_enabled     = true;
var new_debugging_enabled = true;

var moment = require('moment');

exports.logDatabaseQueryError = function (eventFired, error, result) {
    if (debugging_enabled) {
        console.error(error)
        process.stderr.write("Event: " + eventFired);
        process.stderr.write("\tError: " + JSON.stringify(error));
        process.stderr.write("\tResult: " + JSON.stringify(result));
    }
};

exports.consolelog = function (eventFired, error, result) {
    if (debugging_enabled) {
        console.log(eventFired, error, result)
    }
};

var log4js = require('log4js');
log4js.clearAppenders();

log4js.configure({
    appenders: [
        {
            type                : 'dateFile',
            filename            : config.get('logFiles.allLogsFilePath'),
            pattern             : '-yyyy-MM-dd',
            category            : 'all_logs',
            alwaysIncludePattern: true
        },
        {
            type                : 'dateFile',
            filename            : config.get('logFiles.errorLogsFilePath'),
            pattern             : '-yyyy-MM-dd',
            category            : 'error_logs',
            alwaysIncludePattern: true
        }
    ]
});

var logger        = log4js.getLogger('all_logs');
var errorLogger   = log4js.getLogger('error_logs');
logger.setLevel('INFO');
errorLogger.setLevel('INFO');

var employee = {
    register : true,
    registerAuto : true,
    registerCouroutine: true
}

exports.log = log;

function log(apiReference, log) {
    if (new_debugging_enabled
        && apiReference
        && apiReference.module
        && apiReference.api
        && fileSwitches
        && fileSwitches[apiReference.module] == true
        && modules
        && modules[apiReference.module]
        && modules[apiReference.module][apiReference.api] == true) {

        try {
            log = JSON.stringify(log);
        }
        catch (exception) {
        }
        console.log("-->" + moment(new Date()).format('YYYY-MM-DD hh:mm:ss.SSS') + " :----: " +
            apiReference.module + " :=: " + apiReference.api + " :=: " + log);
        logger.info(log);
    }
}

exports.logError = logError;

function logError(apiReference, log) {
    if (apiReference
        && apiReference.module
        && apiReference.api) {

        try {
            log = JSON.stringify(log);
        }
        catch (exception) {
        }
        console.error("-->" + moment(new Date()).format('YYYY-MM-DD hh:mm:ss.SSS') + " :----: " +
            apiReference.module + " :=: " + apiReference.api + " :=: " + log);
        errorLogger.info(log);
    }
}

