const express = require('express');
const path = require('path')



const cors = require('cors')

const sequelise = require('./util/database')
const user = require('./models/user')
const expense = require('./models/expense')
const orders = require('./models/order')
const forgotPassword = require('./models/forgotPassword')

const adminroute = require('./routes/admin');
const userroute = require('./routes/userroute')
const premiumroute = require('./routes/premium')
const passwordroute = require('./routes/password')



const app = express();



app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

app.use('/admin', adminroute);
app.use('/user', userroute);
app.use('/premium',premiumroute);
app.use('/password',passwordroute);

expense.belongsTo(user);
user.hasMany(expense);

orders.belongsTo(user);
user.hasMany(orders)

forgotPassword.belongsTo(user);
user.hasMany(forgotPassword);

sequelise.sync()
//sequelise.sync({force : true})
.then(() => {app.listen(3000, ()=> console.log('sserver is ready at 3000'))}
).catch(err => console.log(err))