const express = require('express');
const path = require('path')



const cors = require('cors')

const user = require('./models/user')
const expense = require('./models/expense')
const orders = require('./models/order')
const sequelise = require('./util/database')

const adminroute = require('./routes/admin');
const userroute = require('./routes/userroute')
const premiumroute = require('./routes/premium')



const app = express();



app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

app.use('/admin', adminroute);
app.use('/user', userroute);
app.use('/premium',premiumroute);


expense.belongsTo(user);
user.hasMany(expense);
orders.belongsTo(user);
user.hasMany(orders)

sequelise.sync()
//sequelise.sync({force : true})
.then(() => {app.listen(3000, ()=> console.log('sserver is ready at 3000'))}
).catch(err => console.log(err))