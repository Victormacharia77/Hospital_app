const express = require('express');
const app = express();
const session = require("express-session");
const cookieParser = require('cookie-parser');
const  initializePassport  = require("./passport");


const bcrypt = require('bcryptjs')
const flash = require('flash')
const mysql = require('mysql')
const query = require('./database');
const passport = require('passport');



//applying middleware


app.use(cookieParser());
app.use(session({
    resave:false,

    saveUninitialized: true, 
    secret: "key that will sign the cookie to our browser"
}
));

/*app.use:initialises passport and makes it available within your routes by creating an instance of the 
middleware and attaching it to the express app
*/
 app.use(passport.initialize());
 app.use(passport.session());

 initializePassport(passport);
app.use((err,req,res,next)=>{
    console.error(err.stack);
 })

 app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});


 
//to enable images and styles to work
app.use('/public', express.static('public'))
 
//to perform authentication related functions on your application 

const { ensureAuthenticated, forwardAuthenticated } = require('./auth');


 //handles json parsing
app.use(express.json());
app.use(express.urlencoded({extended:false}))


//setting up a view engine
app.set('view engine','ejs')

//route for index page

app.get('/',(req,res)=>{
    
    res.render("index")
   
});
  
//route for login page 

app.get('/login',(req,res)=>{
    
    res.render("login")
   
});

app.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


//protecting the patient route using a middleware

app.get('/patient', ensureAuthenticated, (req, res) => {
    res.render('patient');
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


    app.post('/book', async (req, res) => {
const { id,name, email, phone_number,date, message} = req.body
        try {
        const savebooking  =' INSERT INTO appointments (id,name, email , phone_number, date, message) VALUES (?,?, ?, ? ,?, ?)'
  await query(savebooking,[id,name, email,phone_number, date ,message])
    
            req.flash('success_msg', 'Appointment booked successfully');
            res.redirect('/'); 
        } catch (error) {
            req.flash('error_msg', 'Failed to book appointment');
            console.error('Failed to insert into appointments table:', error);
            res.redirect('/'); 
        }
    });

    



//route for total care

app.get('/totalcare',(req,res)=>{
    
    res.render("totalcare")
})

//route for total care

app.get('/doctors',(req,res)=>{
    
    res.render("doctors")
})



app.get('/register',(req,res)=>{
    
    res.render("register")
})

app.post('/register', async (req, res) => {
    let errors = [];
    const { id, name, email, phone_number, password , confirm_password} = req.body;
    if (!name){
        errors.push({ msg: 'Name is required' });
        console.log(errors)
    }
    else if(!email){
        errors.push({ msg: 'Email is required' });
        console.log(errors)
    }
    else if(!phone){
        errors.push({ msg: 'Phone number is required' });
        console.log(errors)
    }
    else if(!password){
        errors.push({ msg: 'Password is required' });
        console.log(errors)
    }
    else  if(password.length<8){
        errors.push({ msg: 'Password must be at least 8 characters' });
        console.log(errors)
    }

    else if(password != confirm_password){
        errors.push({ msg: 'Passwords do not match' });
        console.log(errors)
    }
//checks if the errors array contains any validation errors ,if there are errors the length of the errors will be less than 0
if(errors.length>0){
    console.log(errors)

    res.render('register', {
        errors,
        name,
        email,
        phone,
        password,
        confirm_password
    })
} 

    

    try {
        // Hash the password
        const password_hash = await hashPassword(password);

        // Insert the doctor details into the database
        const doctor_details = 'INSERT INTO doctors (id, name, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)';

        await query(doctor_details, [id, name, email, phone_number, password_hash]);

        req.flash('success_msg', 'Doctor registration successful');
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', 'Failed to register a doctor');
        console.error('Failed to insert into doctors table:', error);
        res.redirect('/');
    }
});

// Function to hash the password
async function hashPassword(password) {
    // Use a secure hashing algorithm (e.g., bcrypt) to hash the password
    // Example using bcrypt:
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}





//create a port
const port = 7500;
app.listen(port,()=>console.log('Listen on port 7500.......'))

