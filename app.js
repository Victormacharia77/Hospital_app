const express = require("express");
const app = express();


//to enable images and styles to work
app.use(express.static('public'))
app.use('/public', express.static('public'))


//setting up a view engine
app.set('view engine','ejs')

//route for index page

app.get('/',(req,res)=>{
    
    res.render("index")
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

