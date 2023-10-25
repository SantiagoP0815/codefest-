const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.fullname));
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The email does not exists.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const { fullname } = req.body;
  
  // Verifica si ya existe un usuario con el mismo correo electrónico
  const existingUser = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

  if (existingUser.length > 0) {
    // Ya existe un usuario con el mismo correo electrónico
    return done(null, false, req.flash('message', 'Email is already in use'));
  } else {
    // El correo electrónico no está en uso, puedes proceder a crear el nuevo usuario
    const newUser = {
      fullname,
      email,
      password
    };
    newUser.password = await helpers.encryptPassword(password);
    
    // Guarda el nuevo usuario en la base de datos
    const result = await pool.query('INSERT INTO users SET ?', newUser);
    newUser.u_id = result.insertId;
    
    return done(null, newUser);
  }
}));



passport.serializeUser((user, done) => {
  done(null, user.u_id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE u_id = ?', [id]);
  done(null, rows[0]);
});

