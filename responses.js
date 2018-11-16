

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
    PARAMETER_MISSING                                : 'PARAMETER_MISSING',

}

exports.responseFlags = {};
define(exports.responseFlags, 'PARAMETER_MISSING', 100);

