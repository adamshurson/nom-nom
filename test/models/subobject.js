const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subobject = new Schema({
    property: String
});

module.exports = mongoose.model('subobject', subobject);