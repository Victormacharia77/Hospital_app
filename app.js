const express = require('express');
const app = express();
const session = require("express-session");
const cookieParser = require('cookie-parser');
const  initializePassport  = require("./passport");



const flash = require('flash')
const mysql = require('mysql')
const query = require('./database');
const passport = require('passport');
const bcrypt = require('bcrypt');


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

 app.use(require('flash')());

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
  
// Route for login page
app.get('/login', forwardAuthenticated, (req, res) => {
    res.render('login');
});

// Route for handling login form submission
app.post('/login', passport.authenticate('local', {
    successRedirect: '/patient',
    failureRedirect: '/',
    failureFlash: true
}));

// Route for the patient dashboard, protected by authentication
app.get('/patient', ensureAuthenticated, (req, res) => {
    
    res.render('patient');
});

// Route for submitting patient information
app.post('/patient', async (req, res) => {
    const { id, name, age, gender, diagnosis, treatment, date } = req.body;
    try {
        const patient_input = 'INSERT INTO patient_info (id, name, age, gender, diagnosis, treatment, date) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await query(patient_input, [id, name, age, gender, diagnosis, treatment, date]);
        req.flash('success_msg', 'Patient information successfully entered');
        res.redirect('/patient');
    } catch (error) {
        req.flash('error_msg', 'Failed to input patient information');
        console.error('Failed to insert into patient_info table:', error);
        res.redirect('/');
    }
});



//route for ambulance page

app.get('/ambulance',(req,res)=>{
    
    res.render("ambulance")
})

//route for checkup page

app.get('/checkup',(req,res)=>{
    
    res.render("checkup")
})
app.post('/checkup', async (req, res) => {
    const { id,full_name, email, date, message} = req.body
    console.log(req.body)
   
    
            try {
            const checkupbook  =' INSERT INTO checkup (id,name, email , date, message) VALUES (?,?,?,?,?)'
      await query(checkupbook,[id,full_name, email, date ,message])
       
                req.flash('success_msg', 'checkup booked successfully');
                res.redirect('/'); 
            } catch (error) {
                req.flash('error_msg', 'Failed to book a checkup');
                console.error('Failed to book a checkup:', error);
                res.redirect('/checkup'); 
            }

        });

//route for inpatient services

app.get('/inpatient',(req,res)=>{
    
    res.render("inpatient")
})
//route for pharmacy services

app.get('/pharmacy',(req,res)=>{
    
    res.render("pharmacy")
})

app.get('/nurses',(req,res)=>{
    
    res.render("nurses")
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
    try {
        let errors = [];
    const { id, name, email, phone_number, password,confirm_password} = req.body;
    
 //  if (password.length<8){
 //      errors.push({ msg: 'Password must be at least 8 characters' });
  //     console.log(errors)
  // }

     if (password != confirm_password){
        errors.push({ msg: 'Passwords do not match' });
        console.log(errors)
    }
//checks if the errors array contains any validation errors ,if there are errors the length of the errors will be less than 0
else if (errors.length>0){
    console.log(errors)
    

    res.render('register', {
        errors,
        name,
        email,
        phone_number,
        password,
        confirm_password
    })
   
} 
else{
     // Insert the doctor details into the database
     const doctor_details = 'INSERT INTO doctors (id, name, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)';
     const saltRounds = 10;
     const hashedPassword = await bcrypt.hash(password, saltRounds);
     
     await query(doctor_details, [id, name, email, phone_number, hashedPassword]);

     req.flash('success_msg', 'Doctor registration successful');
     res.redirect('/');

    
}

      
    } catch (error) {
        req.flash('error_msg', 'Failed to register a doctor');
        console.error('Failed to insert into doctors table:', error);
        res.redirect('/');
    }

   
   
});



//route of nurse page
app.get('/doctors',(req,res)=>{
    
    res.render("doctors")
})





//create a port
const port = 8080;
app.listen(port,()=>console.log('Listen on port 8080.......'))

