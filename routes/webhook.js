const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const admincontroller = require('./../cantroller/admincantrole')




router.post('/stripe-webhook',bodyParser.raw({ type: 'application/json' }), admincontroller.paymentHandler);

module.exports = router 
