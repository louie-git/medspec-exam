const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
// const ejs = require('ejs'); 
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

const app = express();

//css rendering
app.use(express.static('public'))
app.use('/css',express.static(__dirname + 'public/css'))
app.use('/assets',express.static(__dirname + 'public/assets'))

//passport conf
require('./config/passport')(passport);

//db config
const db = require('./config/keys').MongoURI;

//db con
mongoose.connect(db,{useNewUrlParser:true})
.then(()=>console.log('Database Connected..'))
.catch(err => console.log(err))

//ejs
app.use(expressLayouts);
app.set('view engine','ejs')

//body parser
app.use(express.urlencoded({extended:false}))

//express session 
app.use(session({
    secret: 'secrete',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


//connect flash
app.use(flash());

//
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});
  



//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))


const PORT = process.env.PORT || 5000;

app.listen(PORT,
    console.log('Server is running')
)