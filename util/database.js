const Sequelize = require('sequelize');

const sequelize = new Sequelize('expensetracker', 'root', 'Akshay@2000', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;