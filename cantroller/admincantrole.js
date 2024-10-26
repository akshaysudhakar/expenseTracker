const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const user = require('./../models/user');
const order= require("./../models/order");

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

        const newUser = await user.create(data);
        
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

/*exports.premium_handler =  async (req,res,next)=>{
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

        const usertoken = tokenVerify.generateToken(User.id,User.email,User.premium)
        console.log("the client secret",payment_intent.client_secret, "the whole payment intent", payment_intent);

        res.status(200).send({
            clientSecret : payment_intent.client_secret,
            message : "you are now a premium user",
            user_token : usertoken
        })
    }
    catch(err){
        console.error('Payment Handling Error:', err);
        res.status(500).json({message : "an error at payment handling"})
    }
}*/

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
        success_url: `https://ec2-13-234-76-163.ap-south-1.compute.amazonaws.com:3000/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'https://ec2-13-234-76-163.ap-south-1.compute.amazonaws.com:3000/cancel.html',
      });
      const data = {
        amount : 50,
        status : 'pending',
        userId : req.user.id,
        sessionId : session.id
      }

      await order.create(data)

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
    const User = await user.findByPk(req.user.id);

    const usertoken = tokenVerify.generateToken(User.id,User.email,User.premium)

    res.status(200).json({userToken : usertoken})
    
  }
  catch(err){
    console.log(err)
    res.status(500).json(err)
  }
  
}

  
async function updateUser(sessionId,status){     
    const Order = await order.findOne({where: {sessionId : sessionId}});

    if(Order){
      const userId = Order.userId

      Order.status = status

      await Order.save()

      const User = await user.findByPk(userId)
      
      User.premium = true;

      await User.save();

    }
}