const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./../models/user');
const Order= require("./../models/order");

const tokenVerify = require("../util/helpers")

require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhook = process.env.WEB_HOOK;



exports.addUser = async (req, res, next) => {
    const data = req.body;
    console.log(data)
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        data.password = hashedPassword;

        const newUser = new User(data);

        await newUser.save();
        
        console.log('Successfully added a new user');
        res.json({ message: 'your account has been created' })

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



exports.premium_handler = async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'cashapp','amazon_pay'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Membership',
            },
            unit_amount: 5000, // $50 in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:3000/cancel.html',
      });
      const data = {
        amount : 50,
        status : 'pending',
        sessionId : session.id,
        user : req.user,
      }

      const order = new Order(data);

      await order.save();

      res.json({ id: session.id });

    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  

exports.paymentHandler = async (req, res) => {
  console.log('entered webhook')
  const sig = req.headers['stripe-signature']; // Stripe signature header
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhook);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment Intent was successful:', paymentIntent);
      break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('Payment Method was attached:', paymentMethod);
      break;

    case 'checkout.session.completed':
      const checkout = event.data.object;
      console.log('Payment checkout was successfull:', checkout);

      await updateUser(checkout.id,checkout.status)
      break;


    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.sendStatus(200);
};

exports.confirmPayment = async (req,res,next)=>{
  try{
    const user = await User.findById(req.user.id);

    const usertoken = tokenVerify.generateToken(user.id,user.email,user.premium)

    res.status(200).json({userToken : usertoken})
    
  }
  catch(err){
    console.log(err)
    res.status(500).json(err)
  }
  
}

  
async function updateUser(sessionId,status){     
    const order = await Order.findOne({sessionId : sessionId});

    if(order){
      const userId = order.user

      order.status = status

      await order.save()

      const user = await User.findById(userId);
      
      user.premium = true;

      await user.save();

    }
}