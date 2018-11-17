var apiReferenceModule = "employee";
var Promise = require('bluebird');
var Joi = require('joi');
const async = require('async');
var fs = require('fs');
const util = require('util');
var logging = require("./logging");
var responses = require("./responses");
const readFile = util.promisify(fs.readFile);
var commonFunc = require("./commonFunction");

//login
function login(req, res) {
  var employee_email = req.body.email;
  var password = req.body.password;
  connection.query('SELECT * FROM employee WHERE email = ?', [employee_email], function (error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      // console.log('The solution is: ', results);
      if (results.length > 0) {
        if (results[0].password == password) {
          res.send({
            "code": 200,
            "success": "login sucessfull"
          });
        }
        else {
          res.send({
            "code": 204,
            "success": "Email and password does not match"
          });
        }
      }
      else {
        res.send({
          "code": 204,
          "success": "Email does not exits"
        });
      }
    }
  });
}

//registerWaterfall
function registerWaterfall(req, res) {
  var apiReference = {
    module: apiReferenceModule,
    api: "register"
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

  async.waterfall([

    function (callback) {
      logging.log(apiReference, {
        EVENT: "CHECK FOR REQBODY AND MAN DATA",
        REQ_BODY: req.body
      });

      var result = [employee_name, email];
      if (commonFunc.checkBlank(result)) {
        return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
          responses.responseFlags.PARAMETER_MISSING, {}, apiReference);
      };
      callback(null, result);
    },

    function (result, callback) {
      connection.query('select * from employee WHERE email = ?', [response.email], function (err, result) {
        if (err) throw err;

        callback(null, result)
      })
    },
    function (result, callback) {
      if (result.length != 0) {
        console.log("Email exists");
        res.end()
      }
      else {
        callback(null)
      }
    },
    function (callback) {
      var params = [response.employee_name, response.email, response.password, response.created, response.modified];
      var insert = "INSERT into employee (employee.name, email,password, created) values ?";
      connection.query(insert, params, function (err, data) {
        if (err) {
          cb(err);
        }
        cb(null, data);
      });
    },
    function (data, callback) {
      connection.query('select * from employee where email = ?', [response.email], function (err, result) {
        if (err) throw err;

        callback(null, result)
      })
    }],
    function (err, result) {
      if (err) {
        console.log("error", err);
        return responses.responseMessageCode.ERROR;
      }
      if (result.affectedRows == 1) {
        return responses.sendCustomResponse(res, "ERROR", responses.responseFlags.ERROR, {}, apiReference)
      }
    })
}
//registerAuto
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

  var validateReq = Joi.validate({ employee_name, email, password }, schema);
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
      var insert = "INSERT into employee (employee_name, email, password, created) values ?";
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

//registerCouroutine
async function registerCouroutine(req, res) {
  var apiReference = {
    module: apiReferenceModule,
    api: "registerCouroutine"
  };
  var today = new Date();
  var response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  }

  Promise.coroutine(function* () {
    var getResult = yield getEmployee(response.email);
    if (getResult && getResult.length > 0) {
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
    return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
      responses.responseFlags.SUCCESS, {}, apiReference); 
     }).catch(error => {
    console.log("error", error);
    return responses.sendCustomResponse(res, responses.responseMessageCode.ERROR,
      responses.responseFlags.ERROR, {}, apiReference);  })
}

//registerWithAwait
async function registerWithAwait(req, res) {
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
    return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
      responses.responseFlags.PARAMETER_MISSING, {}, apiReference);  }

  try {
    let getEmployee = await getEmployee("employee", response.email);
    if (!getEmployee) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.NOT_FOUND,
        responses.responseFlags.NOT_FOUND, {}, apiReference);    }

    let insertEmployee = await insertEmployee("employee", response);
    if (insertEmployee.affectedRows == 1) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.DATA_INSERTED,
        responses.responseFlags.SUCCESS, {}, apiReference);    }    
    let getEmployee = await getEmployee("employee", response.email);
    if (getEmployee) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.DATA_RETRIEVED,
        responses.responseFlags.SUCCESS, {}, apiReference);    }

  } catch (err) {
    console.log(err)
    return responses.sendCustomResponse(res, responses.responseMessageCode.SUCCESS,
      responses.responseFlags.SUCCESS, {}, apiReference);
  }
}

//registerWithPromise
async function registerWithPromise(req, res) {
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

  const promise = new Promise((resolve, reject) => {
    let getEmployee = await getEmployee("employee", response.email);
    if (!getEmployee) {
      return responses.responseMessageCode.NO_RECORDS_FOUND;
    }

    let insertEmployee = await insertEmployee("employee", response);
    if (insertEmployee.affectedRows == 1) {
      return responses.responseMessageCode.DATA_INSERTED;
    }
    let getEmployee = await getEmployee("employee", response.email);
    if (getEmployee.length) {
      resolve(getEmployee)
    } else {
      reject(getEmployee)
    }
  });
  promise.then(function (results) {
  }).catch(function (error) {
    console.log('error');
  })
}

//doFilePromisify
async function doFilePromisify() {
  try {
    const text = await readFile('./index.js', 'utf8');
    console.log(text);
  } catch (err) {
    console.log('Error', err);
  }
}
doFilePromisify();

//promiseToCallback
function promiseToCallback() {
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

  async.series({
    getData: function (cb) {
      Promise.coroutine(function* () {
        let getEmployee = yield getEmployee("employee", response.email);
        if (!getEmployee) {
          return responses.responseMessageCode.NO_RECORDS_FOUND;
        }
      })().then(function (result) {
        cb(null, result);
      }, function (error) {
        cb(null, error);
      });
    },
    insertData: function (cb) {
      Promise.coroutine(function* () {
        let insertEmployee = yield insertEmployee("employee", response);
        if (insertEmployee.affectedRows == 1) {
          return responses.sendCustomResponse(res, responses.responseMessageCode.DATA_INSERTED,
            responses.responseFlags.SUCCESS, {}, apiReference);        }
      })().then(function (result) {
        cb(null, result);
      }, function (error) {
        cb(null, error);
      });
    }

  },
    function (error, results) {
      if (error) {
        return responses.sendCustomResponse(res, responses.responseMessageCode.ERROR,
          responses.responseFlags.ERROR, {}, apiReference);
              }
              return responses.sendCustomResponse(res, responses.responseMessageCode.SUCCESS,
                responses.responseFlags.SUCCESS, {}, apiReference);  
                });
}

//fn to getemployee 
function getEmployee(email) {
  return new Promise((resolve, reject) => {
    var sql = `SELECT * FROM employee WHERE email = ?`;
    connection.query(sql, email, function (error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

//fn to insertRecord
function insertRecord(response) {
  return new Promise((resolve, reject) => {
    var sql = `INSERT INTO employee values ?`;
    connection.query(sql, [response], function (error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

//exampleSetImmediate
function exampleSetImmediate(req, res){
  setTimeout(function(){
    console.log('status 5'); // wait like a normal fn
  }, 0);
  
  setImmediate(function(){
    console.log('status 4'); 
    // It will get to last and be take care of first 
    // will be always before of setInterval(, 0)
  });
    
  console.log('status 1');
  console.log('status 2');

  //another example
  fs.readFile("my-file-path.txt", function() {
    setTimeout(function(){
        console.log("SETTIMEOUT");
    });
    setImmediate(function(){
        console.log("SETIMMEDIATE");
    });
});

}



module.exports = {
  registerWaterfall,
  login,
  registerAuto,
  registerCouroutine,
  insertRecord,
  registerWithAwait,
  registerWithPromise,
  doFilePromisify,
  promiseToCallback,
  exampleSetImmediate



}