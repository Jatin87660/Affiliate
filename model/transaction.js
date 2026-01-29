const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number
        
    }
    
   
} , { timestamps: true });

module.exports = mongoose.model('transactions', transactionSchema);
