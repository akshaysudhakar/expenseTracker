const bcrypt = require('bcrypt');
const sib = require("sib-api-v3-sdk");

const User = require("./../models/user")
const Fpassword = require("./../models/forgotPassword")

const tokenVerify = require("../util/helpers")


const client = sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY



exports.forgotPassword = async (req,res,next) => {
    const pemail = req.body.pemail
    const transEmailApi = new sib.TransactionalEmailsApi();
    const sender = {
        email : "akshayvisionary@gmail.com"
    }
    const recievers = [
        {
            email : pemail
        }
    ]
    try{
        console.log('entered try block');


        const user = await User.findOne(
            {
                email: req.body.uemail
            }
        )
        

        const user_id = user.id;
        const token = tokenVerify.generateToken(user_id,req.body.uemail,User.premium);
        const data = {
            isActive : true,
            user : user_id
        }
        const forgotPasswordEntry = new Fpassword(data)

        await forgotPasswordEntry.save();

        const uuid = forgotPasswordEntry.id

        const email =await transEmailApi.sendTransacEmail({
            sender,
            to : recievers,
            subject : 'hello there!!!',
            htmlContent : 
            `<html>
            <body>
              <h1>to reset your Password, click the link below</h1>
              <a href = "http://localhost:3000/password/resetPasswordVerify/${uuid}" >reset password </a>
            </body>
          </html>`
        })

        res.status(200).json({message : "check your mail for reset password link",token :token,uuid : uuid})
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)
    }   
}

exports.resetPasswordVerify = async (req,res,next) => {
    const forgotPasswordId = req.params.id
    try {
        const forgot_password_entry = await Fpassword.findOne({id :forgotPasswordId})
        if(forgot_password_entry.isActive){
            res.redirect("/resetPassword.html")
        }
        else{
            console.log('link is not active')
            throw new Error
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: "some error occured, please try again with new link"})
    }
}

exports.resetPasswordNew = async (req,res,next)=>{
    const newPassword = req.body.newPassword;
    const uuid = req.body.uuid;
    try{
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        req.user.password = hashedPassword;

        await req.user.save();

        const forgotPasswordLinks = await Fpassword.findOne({id : uuid})

        forgotPasswordLinks.isActive = false;

        await forgotPasswordLinks.save();

        res.status(200).json({message:"successfully changed the password"})     
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"your password could not be changed"})
    }
}