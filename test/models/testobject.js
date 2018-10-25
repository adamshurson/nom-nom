const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testobject = new Schema({
    property1: String,
    property2: String,
    subobject: {
        type: Schema.Types.ObjectId,
        ref: 'subobject'
    }
});

module.exports = mongoose.model('testobject', testobject);