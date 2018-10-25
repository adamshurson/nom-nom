const mongoose = require("mongoose"); 
const chai = require('chai'); 
const chaiHttp = require('chai-http'); 
const server = require('../server'); 
const should = chai.should(); 
const TestObject = require('../models/testobject'); 
const SubObject = require('../models/subobject'); 

chai.use(chaiHttp); 
describe('Test Object', () =>  {
    beforeEach(done =>  {
        TestObject.deleteMany( {}, err =>  {
            SubObject.deleteMany( {}, err => {
                done();
            });
        }); 
    });
    
    describe('/GET Test Object', () =>  {
        it('it should GET all the Test Objects', done =>  {
            chai.request(server)
            .get('/testobject')
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('array'); 
                done(); 
            }); 
        });
        it('it should GET the Test Object with populated object ids', done => {
            const test =  {
                property1: "test", 
                property2: "object"
            }; 
            chai.request(server)
            .post('/testobject')
            .send(test)
            .end((err, res) =>  {
                const subobject = {
                    property: 'test subobject'
                };
                const testobject = res.body.payload;
                chai.request(server)
                .post('/subobject')
                .send(subobject)
                .end((err, res) => {
                    testobject.subobject = res.body.payload._id;
                    chai.request(server)
                    .put('/testobject')
                    .set('populate', true)
                    .send(testobject)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.payload.subobject.should.be.a('object');
                        done();
                    });
                });
            }); 
        });
    });
    
    describe('/POST Test Objects', () =>  {
        it('it should POST a Test Objects', done =>  {
            const test =  {
                property1: "test", 
                property2: "object"
            }; 
            chai.request(server)
            .post('/testobject')
            .send(test)
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('object'); 
                res.body.payload.property1.should.eq('test'); 
                res.body.payload.property2.should.eq('object'); 
                done(); 
            }); 
        }); 
    });
    
    describe('/PUT Test Object', () =>  {
        let existingTest =  {}; 
        beforeEach(done =>  {
            const testInfo =  {
                property1: "test", 
                property2: "object"
            }; 
            const test = new TestObject(testInfo); 
            test.save((err, test) =>  {
                existingTest = test; 
                done(); 
            }); 
        }); 
        
        it('it should PUT a Test Object', done =>  {
            existingTest.property1 = 'new prop'; 
            chai.request(server)
            .put('/testobject')
            .send(existingTest)
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('object'); 
                res.body.payload.property1.should.eq('new prop'); 
                done(); 
            }); 
        }); 
    }); 

    describe('/OPTIONS Test Object', () =>  {
        it('it should get the fields a Test Objects', done =>  {
            chai.request(server)
            .options('/testobject')
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('array');
                done(); 
            }); 
        }); 
    });
    
}); 