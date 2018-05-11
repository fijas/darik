'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const models = require("../models");

let User = models.user;

chai.use(require('chai-http'));

const app = require('../app.js'); // Our app

describe('API endpoint /signup', function () {
    this.timeout(5000); // How long to wait for a response (ms)

    before(function () {
        return User.sync({force: true});
    });

    after(function () {

    });

    // GET - List all colors
    it('should return details of user that signed up', function () {
        return chai.request(app)
            .post('/signup')
            .send({
                "email": "fijas.p@gmail.com",
                "password": "fijashash123",
                "firstName": "Fijas",
                "lastName": "Pocker"
            })
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('userData');
                expect(res.body.userData.email).to.equal('fijas.p@gmail.com');
            });
    });
});

describe('API endpoint /login', function () {
    this.timeout(5000); // How long to wait for a response (ms)

    before(function () {

    });

    after(function () {

    });

    // GET - List all colors
    it('should login using signed up details', function () {
        return chai.request(app)
            .post('/login')
            .send({
                "email": "fijas.p@gmail.com",
                "password": "fijashash123"
            })
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('userData');
                expect(res.body).to.have.property('token');
                expect(res.body.userData.email).to.equal('fijas.p@gmail.com');
            });
    });
});
