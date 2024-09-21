/*const expense = require('./../models/expense');
const user = require('./../models/user');
const sequelise = require("./../util/database")
const tokenVerify = require("./../util/helpers")
const bcrypt = require('bcrypt');
*/
const sib = require("sib-api-v3-sdk");
const client = sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY

//const jwt = require('jsonwebtoken');


exports.forgotPassword = async (req,res,next) => {
    const email = req.body.email
    const transEmailApi = new sib.TransactionalEmailsApi();
    const sender = {
        email : "akshayvisionary@gmail.com"
    }
    const recievers = [
        {
            email : email
        }
    ]
    try{
        const email =await transEmailApi.sendTransacEmail({
            sender,
            to : recievers,
            subject : 'hello there!!!',
            textContent : "have a nice day"
        })
        res.json({messsage : "check your mail",email})
    }
    catch(err){
        console.log(err);
        res.status(500).json(err)
    }
    
}