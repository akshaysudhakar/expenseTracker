const express = require('express');
const route = express.Router(); 


const admincantroller = require('./../cantroller/admincantrole')

route.post('/signin', admincantroller.addUser);

module.exports = route;
