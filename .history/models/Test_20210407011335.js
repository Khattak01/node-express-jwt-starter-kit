const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    date:{
       type:Date,
       default:Date.now 
    }
})

module.exports = Test = mongoose.model('test',testSchema)