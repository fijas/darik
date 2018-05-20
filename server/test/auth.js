'use strict';

const chai = require('chai');
const expect = require('chai').expect;

chai.use(require('chai-http'));

const app = require('../app.js'); // Our app

describe('API endpoint /users', () => {

    // POST - User registration
    it('should sign up a new user and return details of user that signed up', (done) => {
        chai.request(app)
            .post('/users')
            .send({
                "email": "fijas.p@gmail.com",
                "password": "fijashash123",
                "firstName": "Fijas",
                "lastName": "Pocker"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('userData');
                expect(res.body.userData.email).to.equal('fijas.p@gmail.com');
                done();
            });
    });
});

describe('API endpoint /login', () => {

    // GET - List all colors
    it('should login using signed up details', (done) => {
        chai.request(app)
            .post('/login')
            .send({
                "email": "fijas.p@gmail.com",
                "password": "fijashash123"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('userData');
                expect(res.body).to.have.property('token');
                expect(res.body.userData.email).to.equal('fijas.p@gmail.com');
                done();
            });
    });
});
