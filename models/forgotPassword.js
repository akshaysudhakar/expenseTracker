const Sequelize = require('sequelize')
const {v4: uuidv4} = require('uuid')

const sequelize = require('./../util/database');

const fpasswordModel = sequelize.define(
    'forgot_password',{
        id:{
            type : Sequelize.UUID,
            defaultValue : uuidv4,
            primaryKey : true
        },
        isActive:{
            type : Sequelize.BOOLEAN,
            allowNull : false
        }
    }
)

module.exports = fpasswordModel;


