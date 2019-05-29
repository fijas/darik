const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const bodyParser = require("body-parser");

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

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
const accountRoute = require('./routes/accounts');
app.use('/accounts', accountRoute);
const categoryRoute = require('./routes/categories');
app.use('/categories', categoryRoute);
const subcategoryRoute = require('./routes/subcategories');
app.use('/subcategories', subcategoryRoute);
const transactionRoute = require('./routes/transactions');
app.use('/transactions', transactionRoute);

const feedRoute = require('./routes/feed');
app.use('/feed', passport.authenticate('jwt', {session: false}), feedRoute);


let port = process.env.PORT || 3001;

//Launch listening server on port defined in env file
app.listen(port, () => {
    console.log('app listening on ' + port.toString())
});

module.exports = app;
