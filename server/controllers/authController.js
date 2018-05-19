const jwt = require('jsonwebtoken');
const passport = require('passport');

// Display list of all Authors.
exports.sign_up = (req, res) => {
    passport.authenticate('local-signup', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user   : user
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            // generate a signed son web token with the contents of user object and return it in the response
            let userData = {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            };
            const token = jwt.sign(userData, 'your_jwt_secret');
            return res.json({userData, token});
        });
    })(req, res);
};

exports.log_out = (req, res) =>  {

};

exports.log_in = (req, res) =>  {
    passport.authenticate('local-login', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user   : user
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            // generate a signed son web token with the contents of user object and return it in the response
            let userData = {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            };
            const token = jwt.sign(userData, 'your_jwt_secret');
            return res.json({userData, token});
        });
    })(req, res);
};
