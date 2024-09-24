const bcrypt = require('bcrypt');
const sib = require("sib-api-v3-sdk");

const sequelize = require("../util/database")
const user = require("./../models/user")
const forgot_password = require("./../models/forgotPassword")

const tokenVerify = require("./../util/helpers")


const client = sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY



exports.forgotPassword = async (req,res,next) => {
    let t;
    const email = req.body.pemail
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
        console.log('entered try block');

        t = await  sequelize.transaction();

        const User = await user.findOne({
            where: {
                email: req.body.uemail
            },
            transaction: t  // Place transaction here
        });
        

        const user_id = User.id;
        const token = tokenVerify.generateToken(user_id,req.body.uemail,User.premium);
        const data = {
            isActive : true,
            userId : user_id
        }
        const forgotPasswordEntry = await forgot_password.create(data,{transaction : t});

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

        await t.commit()
        res.status(200).json({message : "check your mail for reset password link",token :token,uuid : uuid})
    }
    catch(err){
        if(t) await t.rollback()
        res.status(500).json(err)
    }   
}

exports.resetPasswordVerify = async (req,res,next) => {
    const forgotPasswordId = req.params.id
    try {
        const forgot_password_entry = await forgot_password.findByPk(forgotPasswordId)
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
    const token = req.body.token;
    let t
    try{
        t =  await sequelize.transaction();
        const User = await  tokenVerify.verifyToken(token); 
        const userToFetch = await user.findByPk(User.id,{transaction : t});

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        userToFetch.password = hashedPassword;

        await userToFetch.save({transaction : t})

        const forgotPasswordLinks = await forgot_password.findByPk(uuid,{transaction : t}
        )
        forgotPasswordLinks.isActive = false;
        await forgotPasswordLinks.save({transaction : t});

        await t.commit();

        res.status(200).json({message:"successfully changed the password"})     

    }
    catch(err){
        await t.rollback();
        console.log(err);
        res.status(500).json({message:"your password could not be changed"})
    }
}