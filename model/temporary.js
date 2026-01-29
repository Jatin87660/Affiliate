const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        default: ""
    },
    otpExpiry: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }



})

module.exports = mongoose.model('temporary', userSchema);
