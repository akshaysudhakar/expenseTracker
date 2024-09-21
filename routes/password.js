const express = require('express');
const route = express.Router(); 

const passwordcantrole = require('./../cantroller/passwordantrole')


route.post("/forgotPassword", passwordcantrole.forgotPassword);

module.exports = route;