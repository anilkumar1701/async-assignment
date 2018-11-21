let express = require('express');
let bodyParser = require('body-parser');
let mysql = require('mysql');
const util = require('util');
const setImmediatePromise = util.promisify(setImmediate);
let employee = require('./employee')

const app = express();
config = require('config');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

let employee = require('./employee');

const port = process.env.PORT || config.get('PORT')

connection = mysql.createConnection(config.get('database_settings'));


connection.connect(function (err) {
    if (err) {
        console.log('error when connecting to db:', err);
    } else {
        console.log('database connected at...', config.get('database_settings.mysqlPORT'));
    }
});

//routes for async functions
app.post('/registregisterWaterfaller', employee.registerWaterfall);
app.get('/login', employee.login)
app.post('/registerAuto', employee.registerAuto)
app.post('/registerCouroutine', employee.registerCouroutine)
app.post('/insertRecord', employee.insertRecord)
app.post('/logregisterWithAwaitin', employee.registerWithAwait)
app.post('/registerWithPromise', employee.registerWithPromise)
app.post('/doFilePromisify', employee.doFilePromisify)
app.post('/promiseToCallback', employee.promiseToCallback)
app.post('/exampleSetImmediate', employee.exampleSetImmediate)

const server = app.listen(port, function (err, data) {
    console.log(`Server running at ${port} `);
    if (err) {
        console.log(err);
    } else {
        setImmediatePromise().then((value) => {
            console.log("server connected!!!!");
        });
    }
});