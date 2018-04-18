require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const students = require('./students.json');

const app = express();

const {
  SERVER_PORT,
  SESSION_SECRET,
  AUTH_DOMAIN,
  AUTH_CLIENT_ID,
  AUTH_CLIENT_SECRET,
  CALLBACK_URL
} = process.env;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new Auth0Strategy(
    {
      domain: AUTH_DOMAIN,
      clientID: AUTH_CLIENT_ID,
      clientSecret: AUTH_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: 'openid email profile'
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get(
  '/login',
  passport.authenticate('auth0', {
    successRedirect: '/students',
    failureRedirect: '/login',
    connection: 'github'
  })
);

function authenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res
      .status(401)
      .send()
      .end();
  }
}

app.get('/students', authenticated, (req, res) => {
  res
    .status(200)
    .send(students)
    .end();
});

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});
