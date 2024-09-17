const Sequelize = require('sequelize')
const sequelize = require('./../util/database');


const order_model = sequelize.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    amount :{
        type : Sequelize.INTEGER,
        allowNull : false,
    },
    status :{
        type : Sequelize.STRING,
        allowNull : false,
        unique: true
    }
})

module.exports = order_model;