var express = require('express');
var router = express.Router();
var request = require('request');
// index mounts all routes

module.exports = function(app, passport) {
  app.get('/', function(req, res) {
    console.log(req.user)
      res.render('welcome/index', { user: req.user });
  });

  app.get('/users', function(req, res) {
    console.log(req.user)
      res.render('users/index', { user: req.user });
  });


  // OAuth route
  app.get('/auth/google', passport.authenticate(
    'google',
    { scope: ['profile','email'] }
  ));

  // Google OAuth callback route
  app.get('/oauth2callback', passport.authenticate(
    'google',
    {
      successRedirect : '/',
      failureRedirect : '/'
    }
  ));

    // OAuth logout
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
}

function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}