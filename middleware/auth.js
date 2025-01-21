const jwt = require('jsonwebtoken');

const User = require('./../models/user');

require('dotenv').config()
const secret_key = process.env.USERID_SECRET_KEY;




const verifyToken  = (req,res,next)=> {
    console.log(req.headers)
    const token = req.headers.authorisation
    jwt.verify(token,secret_key, (error,decoded)=>{
        if (error){
            console.log(error)
            return res.status(500).json({message: 'authentication error, please try again'})
        }else {   
            console.log(decoded)
            const user = User.findById(decoded.id)
            .then( user => {
                req.user = user;
                next()
            })           
            .catch(err => console.log(err))
        }
    })
}

module.exports = verifyToken;