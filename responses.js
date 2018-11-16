var logging     = require('./logging');


exports.sendCustomResponse = function(res, message, code, data, apiReference, metaInfo = null) {
    var response = {
        "message": message,
        "status": code,
        "data":  data || {},
    };
    if(metaInfo)
        response.metaInfo = metaInfo;

    if(apiReference) {
        logging.log(apiReference, {EVENT : "FINAL RESPONSE", RESPONSE : response});
    }
    res.send(JSON.stringify(response));
    //res.send(response)
};

exports.responseMessageCode = {
    PARAMETER_MISSING       : 'PARAMETER_MISSING',
    NO_RECORDS_FOUND        : 'NO RECORDS FOUND IN DB',
    DATA_RETRIEVED          : 'DATA RETRIEVED SUCCESSFULLY',
    DATA_INSERTED           : 'DATA INSERTED SUCCESSFULLY',
    ACTION_COMPLETE         : 'ACTION COMPLETE',
    ERROR                   : 'ERROR',
    NOT_FOUND               : 'NOT_FOUND'

}

exports.responseFlags = {};
define(exports.responseFlags, 'PARAMETER_MISSING', 100);
define(exports.responseFlags, 'ERROR', 400);
define(exports.responseFlags, 'SUCCESS', 200);
define(exports.responseFlags, 'NOT_FOUND', 404);





