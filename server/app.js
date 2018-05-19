const express = require('express');
const models = require("./models");
const logger = require('morgan');
const passport = require('passport');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// CORS
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);
    // Pass to next layer of middleware
    next();
});

require('./config/passport.js');

const authRoute = require('./routes/auth');
app.use('/', authRoute);

const userRoute = require('./routes/users');
app.use('/users', userRoute);

const institutionRoute = require('./routes/institutions');
app.use('/institutions', institutionRoute);

const feedRoute = require('./routes/feed');
app.use('/feed', passport.authenticate('jwt', {session: false}), feedRoute);


let port = process.env.PORT || 3001;

//Launch listening server on port defined in env file
app.listen(port, () => {
    console.log('app listening on ' + port.toString())
});

const env = process.env.NODE_ENV || "development";
let syncOption = env === "test" ? {force: true} : {};

function syncSequelize() {
    models.sequelize.sync(syncOption).then(function () {
        console.log('Database and models initialized');
        return true;
    }).catch(function (err) {
        console.log(err, "Error setting up / connecting to DB! Retrying in a few seconds...");
        return setTimeout(syncSequelize, 4000);
    });
}
syncSequelize();

module.exports = app;
