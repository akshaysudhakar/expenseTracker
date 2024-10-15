const express = require('express');
const route = express.Router(); 
const authenticate = require('./../middleware/auth')
const passwordcantrole = require('./../cantroller/passwordantrole')


route.post("/forgotPassword", express.json() , express.urlencoded({ extended: true }),passwordcantrole.forgotPassword);

route.get("/resetPasswordVerify/:id",passwordcantrole.resetPasswordVerify);

route.post("/reset_password_new",express.json() , express.urlencoded({ extended: true }),authenticate, passwordcantrole.resetPasswordNew);

module.exports = route;