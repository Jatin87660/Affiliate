const mongoose = require('mongoose');

const pendingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    order_id:{
        type: String,
        required:true,
        unique:true
    },
    amount : {
        type:String,
        required:true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('pending', pendingSchema);
