const bcrypt = require('bcryptjs' ); //hashing password
const LocalStrategy = require('passport-local').Strategy; //implementing local authentication a local authentication with passport

const session = require('express-session');
const query = require('./database');
const passport = require('passport');
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
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return done(null, false, { message: 'Email not registered' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    async function getUserByEmail(email) {
        const sql = 'SELECT * FROM doctors WHERE email = ?';
        const result = await query(sql, [email]);
        return result[0];
    }

    async function getUserById(id) {
        const sql = 'SELECT * FROM doctors WHERE id = ?';
        const result = await query(sql, [id]);
        return result[0];
    }
};
