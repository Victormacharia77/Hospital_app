const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const initializePassport = require("./passport");

const flash = require("flash");
const mysql = require("mysql");
const query = require("./database");
const passport = require("passport");
const bcrypt = require("bcrypt");

//applying middleware

app.use(cookieParser());
app.use(
  session({
    resave: false,

    saveUninitialized: true,
    secret: "key that will sign the cookie to our browser",
  })
);

/*app.use:initialises passport and makes it available within your routes by creating an instance of the 
middleware and attaching it to the express app
*/
app.use(passport.initialize());
app.use(passport.session());

initializePassport(passport);

app.use((err, req, res, next) => {
  console.error(err.stack);
});

app.use(require("flash")());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//to enable images and styles to work
app.use("/public", express.static("public"));

//to perform authentication related functions on your application

const { ensureAuthenticated, forwardAuthenticated } = require("./auth");

//handles json parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//setting up a view engine
app.set("view engine", "ejs");

//route for index page

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login");
});
app.post("/login", (req, res, next) => {
  passport.authenticate("user-local", (err, user, info) => {
    if (err) return next(err);

    if (!user) return res.render("login", { error: info.error });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/patient_register");
    });
  })(req, res, next);
});
// Route for the patient dashboard, protected by authentication
app.get("/patient_register", ensureAuthenticated, (req, res) => {
  res.render("patient_register");
});

// Route for submitting patient information
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

app.post("/patient_register", ensureAuthenticated, async (req, res) => {
  const { id, name, email, age, gender, diagnosis, treatment, time, date } =
    req.body;
  try {
    if (!validateEmail(email)) {
      throw new Error("Invalid email address");
    }
    const patient_input =
      "INSERT INTO patient_info (id, name, email, age, gender, diagnosis, treatment, time, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await query(patient_input, [
      id,
      name,
      email,
      age,
      gender,
      diagnosis,
      treatment,
      time,
      date,
    ]);
    req.flash("success_msg", "Patient information successfully entered");
    res.redirect("/");
  } catch (error) {
    req.flash("error_msg", "Failed to input patient information");
    console.error("Failed to insert into patient_info table:", error);
    res.redirect("/patient_register");
  }
});

//route for ambulance page

app.get("/ambulance", (req, res) => {
  res.render("ambulance");
});

//route for checkup page

app.get("/checkup", (req, res) => {
  res.render("checkup");
});
app.post("/checkup", async (req, res) => {
  const { id, full_name, email, date, message } = req.body;
  console.log(req.body);

  try {
    const checkupbook =
      " INSERT INTO checkup (id,name, email , date, message) VALUES (?,?,?,?,?)";
    await query(checkupbook, [id, full_name, email, date, message]);

    req.flash("success_msg", "checkup booked successfully");
    res.redirect("/");
  } catch (error) {
    req.flash("error_msg", "Failed to book a checkup");
    console.error("Failed to book a checkup:", error);
    res.redirect("/checkup");
  }
});
app.get("/inpatient", (req, res) => {
  res.render("inpatient");
});
//route for inpatient services

app.get("/inpatient", (req, res) => {
  res.render("inpatient");
});
//route for pharmacy services

app.get("/pharmacy", (req, res) => {
  res.render("pharmacy");
});

app.get("/nurses", (req, res) => {
  res.render("nurses");
});
// Function to validate email address
function validateEmail(email) {
  // Use a regular expression to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

// Function to validate phone number
function validatePhoneNumber(phoneNumber) {
  // Use a regular expression to validate the phone number format
  const phoneRegex = /^\d{10}$/; // Assuming a 10-digit phone number format

  return phoneRegex.test(phoneNumber);
}

// POST route for booking appointments
app.post("/book", async (req, res) => {
  console.log("posted");
  const { id, name, email, phone_number, date, time, message } = req.body;

  // Validate email and phone number
  const validEmail = validateEmail(email);
  const validPhoneNumber = validatePhoneNumber(phone_number);

  try {
    if (!validEmail || !validPhoneNumber) {
      req.flash("error_msg", "Invalid email address or phone number");
      res.redirect("/#book");
      return;
    }

    // Check if the name contains only alphanumeric characters
    const validName = /^[a-zA-Z0-9]+$/.test(name);
    if (!validName) {
      req.flash(
        "error_msg",
        "Name should contain only alphabetic and numeric characters"
      );
      res.redirect("/#book");

      return;
    }

    // Check if the patient already exists
    const patientCheckQuery = "SELECT * FROM patient_info WHERE email = ?";
    const [existingPatient] = await query(patientCheckQuery, [email]);

    // If the patient doesn't exist, create a new patient record
    if (!existingPatient) {
      const createPatientQuery =
        "INSERT INTO patient_info (id, name, email, age, gender, diagnosis ,treatment,time ,date) VALUES (?, ?, ?,?,?,?,?,?,?)";
      await query(createPatientQuery, [
        id,
        name,
        email,
        age,
        gender,
        diagnosis,
        treatment,
        time,
        date,
      ]);
    }

    // Book the appointment
    console.log(name);
    const saveBookingQuery =
      "INSERT INTO appointments (id, name, email, phone_number, date, time, message) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await query(saveBookingQuery, [
      id,
      name,
      email,
      phone_number,
      date,
      time,
      message,
    ]);

    req.flash("success_msg", "Appointment booked successfully");
    res.redirect("/");
  } catch (error) {
    req.flash("error_msg", "Failed to book appointment");
    console.error("Failed to insert into appointments table:", error);
    res.redirect("/");
  }
});

//route for total care

app.get("/totalcare", (req, res) => {
  res.render("totalcare");
});

//route for total care

app.get("/doctors", (req, res) => {
  res.render("doctors");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    let errors = [];
    const { id, name, email, phone_number, password } = req.body;

    //  if (password.length<8){
    //      errors.push({ msg: 'Password must be at least 8 characters' });
    //     console.log(errors)
    // }
    if (!validateEmail(email)) {
      errors.push({ msg: "Email is required" });
    }

    //checks if the errors array contains any validation errors ,if there are errors the length of the errors will be less than 0
    if (errors.length > 0) {
      console.log(errors);

      res.render("register", {
        errors,
        name,
        email,
        phone_number,
        password,
      });
    } else {
      // Insert the doctor details into the database
      const doctor_details =
        "INSERT INTO doctors (id, name, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await query(doctor_details, [
        id,
        name,
        email,
        phone_number,
        hashedPassword,
      ]);

      req.flash("success_msg", "Doctor registration successful");
      res.redirect("/");
    }
  } catch (error) {
    req.flash("error_msg", "Failed to register a doctor");
    console.error("Failed to insert into doctors table:", error);
    res.redirect("/");
  }
});

//route of nurse page
app.get("/doctors", (req, res) => {
  res.render("doctors");
});

//create a port
const port = 8080;
app.listen(port, () => console.log("Listen on port 8080......."));
