const Sequelize = require('sequelize')
const sequelize = require('./../util/database');

const expense_model = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    expense :{
        type : Sequelize.DOUBLE,
        allowNull : false,
    },
    catogory :{
        type : Sequelize.STRING,
        allowNull : false,
    },
    description :{
        type : Sequelize.STRING,
        allowNull : false,
    }
})

module.exports = expense_model;