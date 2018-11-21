let apiReferenceModule = "employee";
let Promise = require('bluebird');
let Joi = require('joi');
const async = require('async');
let fs = require('fs');
const util = require('util');
let logging = require("./logging");
let responses = require("./responses");
const readFile = util.promisify(fs.readFile);
let commonFunc = require("./commonFunction");

//login
function login(req, res) {
  let employee_email = req.body.email;
  let password = req.body.password;
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
  let apiReference = {
    module: apiReferenceModule,
    api: "register"
  };
  let today = new Date();
  let response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  };

  let schema = Joi.object().keys({
    employee_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.any().required(),
    created: Joi.Date(),
    modified: Joi.Date()
  });

  let validateReq = Joi.validate({ name, email, password }, schema);
  if (validateReq.error) {
    return responses.responseMessageCode.PARAMETER_MISSING;
  }

  async.waterfall([

    function (callback) {
      logging.log(apiReference, {
        EVENT: "CHECK FOR REQBODY AND MAN DATA",
        REQ_BODY: req.body
      });

      let result = [employee_name, email];
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
      let params = [response.employee_name, response.email, response.password, created, modified];
      let insert = "INSERT into employee (employee.name, email,password, created) values ?";
      connection.query(insert, params, function (err, data) {
        if (err) {
          cb(err);
        }
        cb(null, data);
      });
    },
    function (data, callback) {
      console.log(data, data)
      connection.query('select * from employee where email = ?', [response.email], function (err, result) {
        if (err) 
        throw err;
        else
        {callback(null, result)}
      })
    }],
    function (err, result) {
      if (err) {
        console.log("error", err);
        return responses.responseMessageCode.ERROR;
      }
      if (result.affectedRows == 1) {
        return responses.sendCustomResponse(res, "SUCCESS", responses.responseMessageCode.ERROR, {}, apiReference)
      }
    })
}
//registerAuto
function registerAuto(req, res) {
  let apiReference = {
    module: apiReferenceModule,
    api: "registerAuto"
  };
  let today = new Date();
  let response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  };

  let schema = Joi.object().keys({
    employee_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.any().required(),
    created: Joi.Date(),
    modified: Joi.Date()
  });

  let validateReq = Joi.validate({ employee_name, email, password }, schema);
  if (validateReq.error) {
    return responses.responseMessageCode.PARAMETER_MISSING;
  }

  async.auto({

    checkData: function (cb) {
      logging.log(apiReference, {
        EVENT: "CHECK FOR REQBODY AND MAN DATA",
        REQ_BODY: req.body
      });

      let result = [employee_name, email];
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
      let response = {
        "message": "Email exists",
        "status": 201,
      };
      res.send(JSON.stringify(response));
    }],
    insertData: ['Fetch', 'checkData', function (cb, result) {
      let params = [response.employee_name, response.email, response.password, response.created];
      let insert = "INSERT into employee (employee_name, email, password, created) values ?";
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
  let apiReference = {
    module: apiReferenceModule,
    api: "registerCouroutine"
  };
  let today = new Date();
  let response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  }

  Promise.coroutine(function* () {
    let getResult = yield getEmployees(response.email);
    if (getResult && getResult.length > 0) {
      let response = {
        message: "user with email exist",
        status: 400
      };
      res.send(JSON.stringify(response));
    }

    let insertRecord = yield insertRecords(response);
    if (insertRecord.affectedRows == 1) {
      let response = {
        "message": "Successfully inserted successfully.",
        "status": 200,
      };
      res.send(JSON.stringify(response));
    }
  })().then(result => {
    console.log(result, result);
    return responses.sendCustomResponse(res, responses.responseMessageCode.ACTION_COMPLETE,
      responses.responseFlags.SUCCESS, {}, apiReference);
  }).catch(error => {
    console.log(error, error);
    return responses.sendCustomResponse(res, responses.responseMessageCode.ERROR,
      responses.responseFlags.ERROR, {}, apiReference);
  })
}

//registerWithAwait
async function registerWithAwait(req, res) {
  let apiReference = {
    module: apiReferenceModule,
    api: "registerAuto"
  };
  let today = new Date();
  let response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  };

  let schema = Joi.object().keys({
    employee_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.any().required(),
    created: Joi.Date(),
    modified: Joi.Date()
  });

  let validateReq = Joi.validate({ name, email, password }, schema);
  if (validateReq.error) {
    return responses.sendCustomResponse(res, responses.responseMessageCode.PARAMETER_MISSING,
      responses.responseFlags.PARAMETER_MISSING, {}, apiReference);
  }

  try {
    let getEmployee = await getEmployees("employee", response.email);
    if (!getEmployee) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.NOT_FOUND,
        responses.responseFlags.NOT_FOUND, {}, apiReference);
    }

    let insertEmployee = await insertRecords("employee", response);
    if (insertEmployee.affectedRows == 1) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.DATA_INSERTED,
        responses.responseFlags.SUCCESS, {}, apiReference);
    }
    let getEmployee = await getEmployees("employee", response.email);
    if (getEmployee) {
      return responses.sendCustomResponse(res, responses.responseMessageCode.DATA_RETRIEVED,
        responses.responseFlags.SUCCESS, {}, apiReference);
    }

  } catch (err) {
    console.log(err)
    return responses.sendCustomResponse(res, responses.responseMessageCode.SUCCESS,
      responses.responseFlags.SUCCESS, {}, apiReference);
  }
}

//registerWithPromise
async function registerWithPromise(req, res) {
  let apiReference = {
    module: apiReferenceModule,
    api: "registerAuto"
  };
  let today = new Date();
  let response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  };

  let schema = Joi.object().keys({
    employee_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.any().required(),
    created: Joi.Date(),
    modified: Joi.Date()
  });

  let validateReq = Joi.validate({ name, email, password }, schema);
  if (validateReq.error) {
    return responses.responseMessageCode.PARAMETER_MISSING;
  }

  const promise = new Promise((resolve, reject) => {
    let sqlQuery = `SELECT * FROM employee WHERE email = ?`;
    let getEmployee = await responses.executeSqlQueryPromisify(apiReference, sqlQuery, [response.email]);
    if (!getEmployee) {
      return responses.responseMessageCode.NO_RECORDS_FOUND;
    }

    let sqlQuery = "INSERT INTO employee" +
      " ( employee_name, email, password, created, modified ) " +
      " VALUES ( ?,?,?,?,?)";
    let insertEmployee = await responses.executeSqlQueryPromisify(apiReference, sqlQuery, [response.employee_name, response.email, response.password, created, modified]);
    if (insertEmployee.affectedRows == 1) {
      return responses.responseMessageCode.DATA_INSERTED;
    }
    let getEmployee = await getEmployees("employee", response.email);
    if (getEmployee.length) {
      resolve(getEmployee)
    } else {
      reject(getEmployee)
    }
  });
  promise.then(function (results) {
    console.log('results', results)
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
  let apiReference = {
    module: apiReferenceModule,
    api: "registerAuto"
  };
  let today = new Date();
  let response = {
    employee_name: req.employee_name,
    email: req.query.email,
    password: req.query.password,
    created: today,
    modified: today
  };

  let schema = Joi.object().keys({
    employee_name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.any().required(),
    created: Joi.Date(),
    modified: Joi.Date()
  });

  let validateReq = Joi.validate({ name, email, password }, schema);
  if (validateReq.error) {
    return responses.responseMessageCode.PARAMETER_MISSING;
  }

  async.series({
    getData: function (cb) {
      Promise.coroutine(function* () {
        let getEmployee = yield getEmployees("employee", response.email);
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
        let insertEmployee = yield insertRecords("employee", response);
        if (insertEmployee.affectedRows == 1) {
          return responses.sendCustomResponse(res, responses.responseMessageCode.DATA_INSERTED,
            responses.responseFlags.SUCCESS, {}, apiReference);
        }
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
function getEmployees(email) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM employee WHERE email = ?`;
    connection.query(sql, email, function (error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

//fn to insertRecord
function insertRecords(response) {
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO employee" +
      " ( employee_name, email, password, created, modified ) " +
      " VALUES ( ?,?,?,?,?)";;
    connection.query(sql, [response.employee_name, response.email, response.password, created, modified], function (error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

//exampleSetImmediate
function exampleSetImmediate(req, res) {
  setTimeout(function () {
    console.log('status 5'); // wait like a normal fn
  }, 0);

  setImmediate(function () {
    console.log('status 4');
    // It will get to last and be take care of first 
    // will be always before of setInterval(, 0)
  });

  console.log('status 1');
  console.log('status 2');

  //another example
  fs.readFile("my-file-path.txt", function () {
    setTimeout(function () {
      console.log("SETTIMEOUT");
    });
    setImmediate(function () {
      console.log("SETIMMEDIATE");
    });
  });

}
/*The main advantage to using setImmediate() over setTimeout() is setImmediate()
will always be executed before any timers if scheduled within an I/O cycle,
independently of how many timers are present.
Timers cannot guaranteed when its callback gets executed even though the timer expiration period is zero,
immediates queue is guaranteed to be processed immediately after the I/O phase of the event loop.
*/

module.exports = {
  registerWaterfall,
  login,
  registerAuto,
  registerCouroutine,
  insertRecords,
  insertEmployees,
  registerWithAwait,
  registerWithPromise,
  doFilePromisify,
  promiseToCallback,
  exampleSetImmediate



}