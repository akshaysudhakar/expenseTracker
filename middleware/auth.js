const jwt = require('jsonwebtoken');

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
            req.user = decoded
            next()
        }
    })
}

module.exports = verifyToken;