const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    pending: {
        type: Number,
        default: 0
        
    },
    fix:{
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('wallet', walletSchema);
