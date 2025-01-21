const express = require('express');
const route = express.Router(); 
const bodyParser = require('body-parser');
const authenticate = require('./../middleware/auth');

const admincantroller = require('./../cantroller/admincantrole');

// Middleware to log the request body before parsing with express.json

route.post(
    '/signup',                   // Logs body before express.json()
    express.json(),             // Logs body after express.urlencoded()
    express.urlencoded({ extended: true }),
    admincantroller.addUser
);
route.post('/buy_premium', authenticate, admincantroller.premium_handler);
route.post('/buy_premium_status', bodyParser.raw({ type: 'application/json' }), admincantroller.paymentHandler);
route.get('/confirm_payment',authenticate, admincantroller.confirmPayment);

module.exports = route;

