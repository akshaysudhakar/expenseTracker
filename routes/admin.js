const express = require('express');
const route = express.Router(); 


const admincantroller = require('./../cantroller/admincantrole')

route.post('/signin', admincantroller.addUser);
route.post('/login', admincantroller.userlogin )

module.exports = route;
