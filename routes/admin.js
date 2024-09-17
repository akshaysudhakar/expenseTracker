const express = require('express');
const route = express.Router(); 


const admincantroller = require('./../cantroller/admincantrole')

route.post('/signin', admincantroller.addUser);
route.post('/buy_premium', admincantroller.premium_handler)

module.exports = route;
