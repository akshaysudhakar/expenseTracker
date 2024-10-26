const express = require('express');
const route = express.Router(); 
const bodyParser = require('body-parser');
const authenticate = require('./../middleware/auth');

const admincantroller = require('./../cantroller/admincantrole');

// Middleware to log the request body before parsing with express.json
function logBeforeJson(req, res, next) {
    console.log('Request body before express.json:');
    next();
}

// Middleware to log the request body after parsing with express.urlencoded
function logAfterUrlencoded(req, res, next) {
    console.log('Request body after express.urlencoded:');
    next();
}

route.post(
    '/signup',
    logBeforeJson,                    // Logs body before express.json()
    express.json(),
    logAfterUrlencoded,               // Logs body after express.urlencoded()
    express.urlencoded({ extended: true }),
    admincantroller.addUser
);

route.post('/buy_premium', logBeforeJson,  authenticate, admincantroller.premium_handler);
route.post('/buy_premium_status', bodyParser.raw({ type: 'application/json' }), admincantroller.paymentHandler);
route.get('/confirm_payment', logBeforeJson ,authenticate, admincantroller.confirmPayment);

module.exports = route;

