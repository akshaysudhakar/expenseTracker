const express = require('express');
const route = express.Router(); 
const authenticate = require('./../middleware/auth')

route.use(express.urlencoded({ extended: true }))
route.use(express.json());


const usercantrole = require('./../cantroller/usercantrole')

route.post('/add_expense',authenticate, usercantrole.add_expense);

route.get('/get_expense',authenticate, usercantrole.get_expense);

route.post('/login', usercantrole.userlogin );

route.post('/delete_expense', usercantrole.deleteUser)




module.exports = route;