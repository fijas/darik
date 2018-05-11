const bCrypt = require('bcrypt-nodejs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const models = require("../models");
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

let User = models.user;

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'your_jwt_secret'
    },
    function (jwtPayload, cb) {
        console.log(jwtPayload);
        return cb(null, jwtPayload);
    }
));

passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, cb) {
        let generateHash = function (password) {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
        };
        User.findOne({
            where: {
                email: email
            }
        }).then(function (user) {
            if (user) {
                return cb(null, false, {
                    message: 'That email is already taken'
                });
            } else {
                let userPassword = generateHash(password);
                let data = {
                    email: email,
                    password: userPassword,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    status: User.statusCodes.active
                };
                User.create(data).then(function (newUser, created) {
                    if (!newUser) {
                        return cb(null, false);
                    }
                    if (newUser) {
                        return cb(null, newUser);
                    }
                });
            }
        });
    }
));

passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, cb) {
        let isValidPassword = function (userpass, password) {
            return bCrypt.compareSync(password, userpass);
        };

        return User.findOne({
            where: {
                email: email
            }
        }).then(function (user) {
            if (!user) {
                return cb(null, false, {
                    message: 'Email does not exist'
                });
            }
            if (!isValidPassword(user.password, password)) {
                return cb(null, false, {
                    message: 'Incorrect password.'
                });
            }

            return cb(null, user);
        }).catch(function (err) {
            console.log("Error:", err);
            return cb(null, false, {
                message: 'Something went wrong with your Signin'
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// deserialize user
passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
        if (user) {
            done(null, user.get());
        } else {
            done(user.errors, null);
        }
    });
});
