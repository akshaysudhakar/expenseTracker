const Sequelize = require('sequelize')
const sequelize = require('./../util/database');

const user_model = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name :{
        type : Sequelize.STRING,
        allowNull : false,
    },
    email :{
        type : Sequelize.STRING,
        allowNull : false,
        unique: true
    },
    password :{
        type : Sequelize.STRING,
        allowNull : false,
    },
    totalExpense : {
        type : Sequelize.FLOAT,
        allowNull : false,
        defaultValue : 0
    },
    premium : {
        type : Sequelize.BOOLEAN,
        defaultValue : false,
        allowNull : false
    }
})

module.exports = user_model;