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
    app:{
        type: String,
        default:"amazon"
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('commisions', order_id_Schema);
