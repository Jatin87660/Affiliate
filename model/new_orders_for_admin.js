const mongoose = require('mongoose');

const order_id_Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    order_id:{
        type: String,
        required:true,
        unique:true
    },
    amount: {
        type:String,
        required:true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('new_order_id_for_admin', order_id_Schema);
