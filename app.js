const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')


const cors = require('cors')
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan')






const sequelise = require('./util/database')
const user = require('./models/user')
const expense = require('./models/expense')
const orders = require('./models/order')
const forgotPassword = require('./models/forgotPassword')

const adminroute = require('./routes/admin');
const userroute = require('./routes/userroute')
const premiumroute = require('./routes/premium')
const passwordroute = require('./routes/password')

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log') , {flags : 'a'});

const app = express();




const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert')


app.use(express.static(path.join(__dirname,'public')))
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream : accessLogStream}))




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