const jwt = require('jsonwebtoken');

require('dotenv').config()
const secret_key = process.env.USERID_SECRET_KEY;




exports.verifyToken = (token)=> {
    return new Promise((resolve,reject)=>{
        jwt.verify(token,secret_key, (error,decoded)=>{
            if (error){
                reject(error)
            }else {
                resolve(decoded)
            }
        })
    })
}


exports.generateToken =(id,email,premium)=>{
    const payload = {
        id : id ,
        email : email,
        premium : premium
    }
    const secret = "oisjcfnjdhr7238q9ufh"
    return jwt.sign(payload,secret)
}