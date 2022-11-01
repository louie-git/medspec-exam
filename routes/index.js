const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
    res.render('login.ejs');
})

router.get('/default',(req,res)=>{
    res.render('register.ejs');
})
module.exports = router;