'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const models = require("../models");

chai.use(require('chai-http'));

const app = require('../app.js'); // Our app

describe('API endpoint /institutions', () => {

    before(function () {

    });

    after(function () {

    });

    // POST - Add institution
    it('should add user and return details of institutions added by user', (done) => {
        return chai.request(app)
            .post('/institutions')
            .send({
                "name": "State Bank of India",
                "type": models.institution.types.bank,
                "userId": 1
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                done();
            });
    });

    // GET - List all institutions
    it('should return details of institutions added by user', (done) => {
        return chai.request(app)
            .get('/institutions')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.length.above(0);
                done();
            });
    });

    // GET - List one institution
    it('should return details of single institution added by user', (done) => {
        return chai.request(app)
            .get('/institutions/1')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                done();
            });
    });
});
