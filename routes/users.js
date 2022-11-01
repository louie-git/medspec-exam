const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
//Users model
const  User = require('../models/Users')
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth')
const { route } = require('.');
const emailValidator = require('email-validator')

router.get('/register',(req,res)=>{
    let errors= [];
    res.render('register.ejs',{
        errors,
    })
});
//index
router.get('/',ensureAuthenticated,(req,res)=>{
    User.find()
    .then(users=>{

        res.render('dashboard.ejs',{
            users,
            name:req.user.name,
            role:req.user.role
        })
    })
    .catch(err=>{
        console.log(err)
    })
});

//Register User
router.post('/register',ensureAuthenticated, (req,res)=>{
    const {name , email , password, password2, status , role} = req.body
    let errors = [];
   
    if(!name || !email || !password || !password2){
        req.flash('error_msg','Please fill all fields')
        res.redirect('/users')
    }
    if(password !== password2){
        req.flash('error_msg','Password not match!')
        res.redirect('/users')
    }
    if(password.length<5){
        req.flash('error_msg','Password must contain at least 6 characters!')
        res.redirect('/users')
    }
    if(!emailValidator.validate(email)){
        req.flash('error_msg','Email invalid!')
        res.redirect('/users')
    }
    else{
        User.findOne({email:email})
        .then(user => {
            if(user){
                errors.push({message:'Email Exist'})
                res.render('register',{
                    errors,
                    name,
                    email,
                })
            }
            else{
                const newUser = new User({
                    name,
                    email,
                    password,
                    status,
                    role
                });
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(() =>{
                            req.flash('success_msg',`${newUser.email} successfully added`)
                            res.redirect('/users')
                        })
                        .catch(err => {
                            req.flash('error_msg',`System error`)
                            res.redirect('/users')
                        })
                    })
                }) 
            }    
        });
    }
  
});

//Update User
router.post('/update',ensureAuthenticated,(req,res,next)=>{
    let userId = req.body.id;
    let updatedData = {
        name:req.body.name,
        email:req.body.email,
        status:req.body.status,
        role:req.body.role
    }
    User.findByIdAndUpdate(userId,{
        $set:updatedData
    })
    .then(()=>{
        req.flash('success_msg', 'User updated successfully!');
        res.redirect('/users')
    })
    .catch(error=>{
        res.render('dashboard.ejs',{
            errors:"Failed to update data"
        })
    })
})

//delete user
router.post('/destroy',ensureAuthenticated,(req,res)=>{
    console.log(req.body.id)
    let userId= req.body.id;
    User.findByIdAndDelete(userId)
    .then(()=>{
        req.flash('success_msg', 'Deleted successfully');
        res.redirect('/users')
    })
    .catch(error=>{
        res.json({
            message:`Fail to delete user ${error}`
        })
    })
})

//login 
router.post('/login',(req,res,next)=>{
    passport.authenticate('local', {
        successRedirect: '/users',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
})
//logout 
router.get('/logout', (req, res) => {
    req.logout((err)=>{
        if(err){
            console.log('unable to logout')
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
});



module.exports = router;   