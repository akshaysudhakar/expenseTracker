const express = require('express');
const route = express.Router(); 

const premiumcantrole = require('./../cantroller/premiumcantrole')

route.get('/leaderboard',premiumcantrole.leaderBoard);

module.exports = route;