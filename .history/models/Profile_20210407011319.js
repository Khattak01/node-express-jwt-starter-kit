const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true,
    },
    detailInfo:
    {
        contactType: {
            type: String,
        },
        address: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        dob: {
            type: String
        },
        coordinates:[{type:String}]
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);