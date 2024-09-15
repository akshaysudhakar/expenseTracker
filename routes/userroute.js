const express = require('express');
const route = express.Router(); 


const usercantrole = require('./../cantroller/usercantrole')

route.post('/add_expense', usercantrole.add_expense);

route.get('/get_expense', usercantrole.get_expense);

route.post('/login', usercantrole.userlogin );

route.post('/delete_expense', usercantrole.deleteUser)


module.exports = route;