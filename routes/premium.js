const express = require('express');
const route = express.Router(); 
const authenticate = require('./../middleware/auth')

const premiumcantrole = require('./../cantroller/premiumcantrole')

route.get('/leaderboard',premiumcantrole.leaderBoard);

route.get('/download',authenticate, premiumcantrole.downloadExpense)

module.exports = route;