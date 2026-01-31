const express = require('express');
const router = express.Router();
const User = require('../model/user')
const Order = require('../model/order_id')
const Pending = require('../model/pending_orders')

router.post('/login',async (req,res)=>{
    const {email,key} = req.body;
    
})



module.exports =router;