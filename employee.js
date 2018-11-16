var apiReferenceModule = "employee";

var request = require('request');
var Promise = require('bluebird');
var Joi = require('joi');
const async = require('async');
var emailExistence = require("email-existence");
var fs = require('fs');
const util = require('util');
var logging        = require("./logging");
var responses      = require("./responses");

var commonFunc     = require("./commonFunction");

const setImmediatePromise = util.promisify(setImmediate);

  function login(req,res){
    var email= req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM employee WHERE email = ?',[email], function (error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code":400,
        "failed":"error ocurred"
      })
    }else{
      // console.log('The solution is: ', results);
      if(results.length >0){
        if(results[0].password == password){
          res.send({
            "code":200,
            "success":"login sucessfull"
              });
        }
        else{
          res.send({
            "code":204,
            "success":"Email and password does not match"
              });
        }
      }
      else{
        res.send({
          "code":204,
          "success":"Email does not exits"
            });
      }
    }
    });
  }


  function registerWaterfall(req, res){
    var apiReference = {
      module: apiReferenceModule,
      api   : "register"
  };
  var today = new Date();
  var  response = {
    employee_name:req.employee_name,
    email:req.query.email,
    password:req.query.password,
    created:today,
    modified:today
 };

  var schema = Joi.object().keys({
  employee_name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.any().required(),
  created: Joi.Date(),
  modified: Joi.Date()
  });

  var validateReq = Joi.validate({ name, email, password }, schema);
  if (validateReq.error) {
    return responses.responseMessageCode.PARAMETER_MISSING;
}

async.waterfall([

  function (callback) {
    logging.log(apiReference, {
      EVENT   : "CHECK FOR REQBODY AND MAN DATA",
      REQ_BODY: req.body
    });

    var result   = [employee_name, email];
    if (commonFunc.checkBlank(result)) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
      responses.responseFlags.PARAMETER_MISSING, {}, apiReference);
  };
  callback(null, result);
  },
  
  function(result,callback)
  {
    connection.query('select * from employee WHERE email = ?',[response.email], function (err, result) {
      if (err) throw err;
      
      callback(null,result)
  })
  },
  function(result,callback)
  {
      if(result.length !=0){
          console.log("Email exists");
          res.end()
      }
      else{
      callback(null)}
  },
  function (callback) {
    var params =[response.employee_name, response.email, response.password, response.created];
    var insert = "INSERT into employee (employee.name, email,password, created) values ?";
    connection.query(insert, params, function(err, data) {
      if (err) {
        cb(err);
    }
      cb(null, data);
    });
},
function(data,callback)
{
    connection.query('select * from employee where email = ?',[response.email],function (err, result) {
        if (err) throw err;
        
        callback(null,result)
    }) 
}],
function (err, result) {
    if (err) {
        console.log("error", err);
        return response.sendActionFailedResponse(res, [], error.message, error.status_code);
    }
    if (result.affectedRows == 1) {
      return response.actionCompleteResponse(res, result);
    }
})
  }

function registerAuto(req, res) {
  var apiReference = {
    module: apiReferenceModule,
    api: "registerAuto"
  };
  var today = new Date();
  var response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  };

  var schema = Joi.object().keys({
    employee_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.any().required(),
    created: Joi.Date(),
    modified: Joi.Date()
  });

  var validateReq = Joi.validate({ name, email, password }, schema);
  if (validateReq.error) {
    return responses.responseMessageCode.PARAMETER_MISSING;
  }

  async.auto({

    checkData: function (cb) {
      logging.log(apiReference, {
        EVENT: "CHECK FOR REQBODY AND MAN DATA",
        REQ_BODY: req.body
      });

      var result = [employee_name, email];
      if (commonFunc.checkBlank(result)) {
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
          responses.responseFlags.PARAMETER_MISSING, {}, apiReference);
      };
      cb(null, result);

    },
    Fetch: ['checkData', function (cb, result) {
      if (result.checkData == 1) {
        data = [];
        cb();
      }
      var response = {
        "message": "Email exists",
        "status": 201,
      };
      res.send(JSON.stringify(response));
    }],
    insertData: ['Fetch', function (cb, result) {
      var params = [response.employee_name, response.email, response.password, response.created];
      var insert = "INSERT into employee (employee.name, email,password, created) values ?";
      connection.query(insert, params, function (err, data) {
        if (err) {
          cb(err);
        }
        cb(null, data);
      });
    }]
  }, function (err, response) {
    if (err) {
      res.send(JSON.stringify(err))
    } else {
      res.send(JSON.stringify({
        "message": "successfull",
        "status": 200,
        "data": data
      }))
    }
  })
}

function registerCouroutine(req, res){
  var apiReference = {
    module: apiReferenceModule,
    api   : "registerCouroutine"
};
var today = new Date();
var  response = {
  employee_name:req.employee_name,
  email:req.query.email,
  password:req.query.password,
  created:today,
  modified:today
}

  Promise.coroutine(function*() {
    var getResult = yield getEmployee(response.email);
    if(getResult && getResult.length > 0){
      var response = {
          message: "user with email exist",
          status: 400
        };
        res.send(JSON.stringify(response));
    }

    var insertRecord = yield insertRecord(response);
    if (insertRecord.affectedRows == 1) {
      var response = {
        "message": "Successfully inserted successfully.",
        "status": 200,
    };
    res.send(JSON.stringify(response)); 
    }
  })().then(result => {
    return response.actionCompleteResponse(res, result);
}).catch(error => {
    console.log("error", error);
    return response.sendActionFailedResponse(res, [], error.message, error.status_code);
})
}


function getEmployee(email) {
  return new Promise((resolve, reject) => {
    var sql = `SELECT * FROM employee WHERE email = ?`;
    connection.query(sql, email, function(error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function insertRecord(response) {
  return new Promise((resolve, reject) => {
    var sql = `INSERT INTO employee values ?`;
    connection.query(sql, [response], function(error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}



module.exports = {
    registerWaterfall,
    login ,
    registerAuto ,
    registerCouroutine,
    insertRecord,
    
    
}