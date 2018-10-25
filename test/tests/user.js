const mongoose = require("mongoose"); 
const chai = require('chai'); 
const chaiHttp = require('chai-http'); 
const server = require('../server'); 
const should = chai.should(); 
const User = require('../models/user'); 

chai.use(chaiHttp); 
describe('Users', () =>  {
    beforeEach(done =>  {
        User.deleteMany( {}, err =>  {
            done();
        }); 
    });
    
    describe('/GET User', () =>  {
        it('it should GET all the users', done =>  {
            chai.request(server)
            .get('/nom/user')
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('array'); 
                res.body.payload.length.should.eq(0); 
                done(); 
            }); 
        });
    });
    
    describe('/POST User', () =>  {
        it('it should POST a user', done =>  {
            const user =  {
                firstName:"test", 
                lastName:"user"
            }; 
            chai.request(server)
            .post('/nom/user')
            .send(user)
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('object'); 
                res.body.payload.firstName.should.eq('test'); 
                res.body.payload.lastName.should.eq('user'); 
                done(); 
            }); 
        }); 
    });
    
    describe('/PUT User', () =>  {
        let existingUser =  {}; 
        beforeEach(done =>  {
            User.deleteMany( {}, err =>  {
                const userInfo =  {
                    firstName:'test', 
                    lastName:'user'
                }; 
                const newUser = new User(userInfo); 
                newUser.save((err, newUser) =>  {
                    existingUser = newUser; 
                    done(); 
                }); 
            }); 
        }); 
        
        it('it should PUT a user', done =>  {
            existingUser.firstName = 'new name'; 
            chai.request(server)
            .put('/nom/user')
            .send(existingUser)
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('object'); 
                res.body.payload.firstName.should.eq('new name'); 
                done(); 
            }); 
        }); 
    }); 

    describe('/OPTIONS User', () =>  {
        it('it should get the fields a user', done =>  {
            chai.request(server)
            .options('/nom/user')
            .end((err, res) =>  {
                res.should.have.status(200); 
                res.body.success.should.eq(true); 
                res.body.payload.should.be.a('array');
                done(); 
            }); 
        }); 
    });
    
}); 