const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const nom = require('../index');
const port = 3000;

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));  

mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true
});

const nomRouter = nom.nom(path.join(__dirname, './models'));
app.use('/', nomRouter);

module.exports = app;