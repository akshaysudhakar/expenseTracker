const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config(); // Load environment variables from .env file

const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const sequelize = require('./util/database');
const user = require('./models/user');
const expense = require('./models/expense');
const orders = require('./models/order');
const forgotPassword = require('./models/forgotPassword');

const adminroute = require('./routes/admin');
const userroute = require('./routes/userroute');
const premiumroute = require('./routes/premium');
const passwordroute = require('./routes/password');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const app = express();

// Load your private key and certificate
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: true, // Allow requests from your Nginx server
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // Include credentials if necessary
}));
app.use(helmet());
app.use(compression());
//app.use(morgan('combined', { stream: accessLogStream }));

// Set up your routes
app.use('/admin', 
    (req, res, next) => {
        console.log('A request in the admin path', req);
        next();
    }, 
    adminroute
);
app.use('/user', userroute);
app.use('/premium', premiumroute);
app.use('/password', passwordroute);

// Define relationships
expense.belongsTo(user);
user.hasMany(expense);
orders.belongsTo(user);
user.hasMany(orders);
forgotPassword.belongsTo(user);
user.hasMany(forgotPassword);

// Sync Sequelize and start the server
sequelize.sync()
    .then(() => {
        // Get the port from the .env file or use 3000 as a fallback
        const PORT = process.env.PORT || 3000;
        
        // Create an HTTPS server
        const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app);
        
        // Listen on the specified port
        httpsServer.listen(PORT, '0.0.0.0', () => console.log(`Server is ready on port ${PORT}`));
    })
    .catch(err => console.log(err));
