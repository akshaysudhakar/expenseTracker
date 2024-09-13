const express = require('express');
const route = express.Router(); 
const Sequelize = require('sequelize');

const sequelize = require('./../models/user');
const admincantroller = require('./../cantroller/admincantrole')

route.post('/signin', admincantroller.addUser);

module.exports = route;
