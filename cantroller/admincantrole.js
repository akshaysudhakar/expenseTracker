const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const user = require('./../models/user');
const order= require("./../models/order");

const tokenVerify = require("./../util/helpers")

require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



exports.addUser = async (req, res, next) => {
    const data = req.body;
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        data.password = hashedPassword;

        const newUser = await user.create(data);
        
        console.log('Successfully added a new user');
        res.redirect('/form1.html');

    } 
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.json({ message: "This email already exists" });
        } else {
            console.error('Error during user creation:', err);

            res.status(500).json({ message: "An error occurred while adding the user." });
        }
    }
};

exports.premium_handler =  async (req,res,next)=>{
    const {payment_id,user_token} = req.body;
    try{
        const payment_intent = await stripe.paymentIntents.create(
            {
                amount : 5000,
                currency : 'usd',
                payment_method : payment_id,
                confirm: true,
                return_url: 'http://localhost:3000/premium_success.html'
            }
        )

        const userId = await  tokenVerify.verifyToken(user_token)

        const data = {
            amount : 5000,
            status : payment_intent.status,
            userId : userId.id
        };
        await order.create(data)

        const User = await user.findByPk(userId.id);

        User.premium = true;
        
        await User.save();

        res.status(200).send({
            clientSecret : payment_intent.client_secret
        })
    }
    catch(err){
        console.error('Payment Handling Error:', err);
        res.status(500).json({message : "an error at payment handling",errorMesg: err.message})
    }
}

