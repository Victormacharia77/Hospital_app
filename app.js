const express = require("express");
const app = express();

//create a port
const port = 8000;
app.listen (port,(req,res)=>{
    console.log('port created');
})

app.get ("/checkup" ,(req,res)=>{
    res.render('checkup.html')
})