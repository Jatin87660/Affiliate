const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    order_id :{
        type:String
    },
    amount: {
        type: Number
        
    }
    
   
} , { timestamps: true });

module.exports = mongoose.model('transactions', transactionSchema);
