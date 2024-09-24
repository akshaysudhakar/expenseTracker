const express = require('express');
const route = express.Router(); 

const passwordcantrole = require('./../cantroller/passwordantrole')


route.post("/forgotPassword", passwordcantrole.forgotPassword);

route.get("/resetPasswordVerify/:id",passwordcantrole.resetPasswordVerify);

route.post("/reset_password_new",passwordcantrole.resetPasswordNew);

module.exports = route;