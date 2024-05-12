const bcrypt = require('bcrypt' ); //hashing password
const LocalStrategy = require('passport-local').Strategy; //implementing local authentication a local authentication with passport

const session = require('express-session');
const query = require('./database');

//session constructor function 
//creates session object for the user 
//takes in three parameters and sests them as properties of the session object 
function SessionConstructor(userId , userGroup,details) {

    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details;
}

//passport configuration 
    module.exports = function(passport) {
        passport.use('user-local', new LocalStrategy({usernameField:'email'}, async (email, password, done) => {
          try {
            const querys = 'SELECT * FROM doctors WHERE email = ?';
            const rows = await query(querys, [email]);
            if (!rows.length) {
              return done(null, false, { error: 'This email is unregistered' });
            }
            const user = rows[0];
            if (!password) {
              return done(null, false, { error: 'Password is required' });
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { error: 'Password Incorrect' });
              }
            });
          } catch(err) {
            return done(null, false, { error: "Oops! Something went wrong on our end. We apologize for the inconvenience. Please try again later or contact support if the issue persists." });
          }
        }));
      
    passport.serializeUser(function(userObject, done) {
        let sessionConstructor = new SessionConstructor(userObject.id, "userModel", "");
        done(null, sessionConstructor);
      });
      passport.deserializeUser(async function (sessionConstructor, done) {
        if (sessionConstructor.userGroup == 'userModel') {
          const querys = 'SELECT * FROM doctors WHERE id = ?';
          try {
            const rows = await query(querys, [sessionConstructor.userId]);
            if (!rows.length) {
              return done(null, false, { error: 'User not found' });
            }
            const user = rows[0];
            done(null, user);
          } catch(err) {
            return done(null, false, { error: "Oops! Something went wrong on our end. We apologize for the inconvenience. Please try again later or contact support if the issue persists." });
          }
        }
        })
      }
      

















    