const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require('cookie-parser');
const  initializePassport  = require("/.passport");
const passport = require("passport");
const database = require('./database')
const bcrypt = require('bcryptjs')
const flash = require('flash')
const bodyparser = require('body-parser')





//applying middleware
app.use(cookieParser());
app.use(session({
    resave:false,
    saveUnitialised:true,
    secret: "key that will sign the cookie to our browser"
}
))

/*app.use:initialises passport and makes it available within your routes by creating an instance of the 
middleware and attaching it to the express app
*/
app.use(passport.initialize());
app.use(passport.session());

initializePassport(passport);
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500),{message:"oops something went wrong on our end.we apologise for the incovinience.Please try again later"}
})
//uses the body parser middleware to pass urlencoded data received in POST REQUESTS 
//BODY PARSER IS A HTTP request body that usually helps when you need to know more than just the url being hit 

 app.use(bodyparser.urlencoded({extended:true}));
//to enable images and styles to work
app.use(express.static('public'))
app.use('/public', express.static('public'))
 
//to perform authentication related functions on your application 
const {ensureAuthenticated,forwardAuthenticated} = require ('/auth');

//imports ejs module which is used for rendering EJS TEMPLATES IN YOUR EXPRESS TEMPLATES 
const {render} = require('ejs');

//json parsing
const json = require ('body-parser/lib/types/json');

 //handles json parsing
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(bodyparser.json)

//setting up a view engine
app.set('view engine','ejs')

//route for index page

app.get('/',(req,res)=>{
    
    res.render("index")
   
});

app.get('/login',(req,res)=>{
    
    res.render("login")
   
});
//route for ambulance page

app.get('/ambulance',(req,res)=>{
    
    res.render("ambulance")
})

//route for checkup page

app.get('/checkup',(req,res)=>{
    
    res.render("checkup")
})

//route for inpatient services

app.get('/inpatient',(req,res)=>{
    
    res.render("inpatient")
})
//route for pharmacy services

app.get('/pharmacy',(req,res)=>{
    
    res.render("pharmacy")
})


//route for total care

app.get('/totalcare',(req,res)=>{
    
    res.render("totalcare")
})

//route for total care

app.get('/doctors',(req,res)=>{
    
    res.render("doctors")
})
//create a port
const port = 3000;
app.listen (port,(req,res)=>{
    console.log('port created');
})

