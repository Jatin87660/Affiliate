const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
    res.render('home');
})
router.get('/sign-in',(req,res)=>{
    res.render('sign-in');
})
router.get('/login',(req,res)=>{
    res.render('login');
})
router.get('/help',(req,res)=>{
    res.render('help');
})
router.get('/admin/01',(req,res)=>{
    res.render('admin_login');
})






module.exports =router;