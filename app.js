const express = require('express');
const path = require('path')
const cors = require('cors')
const sequelise = require('./util/database')
const app = express();

const user = require('./models/user')
const expense = require('./models/expense')

const adminroute = require('./routes/admin');
const userroute = require('./routes/userroute')

app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

app.use('/admin', adminroute);
app.use('/user', userroute)

sequelise.sync()
//sequelise.sync({force : true})
.then(() => {app.listen(3000, ()=> console.log('sserver is ready at 3000'))}
).catch(err => console.log(err))