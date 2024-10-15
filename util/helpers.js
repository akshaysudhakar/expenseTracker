const jwt = require('jsonwebtoken');


exports.generateToken =(id,email,premium)=>{
    const payload = {
        id : id ,
        email : email,
        premium : premium
    }
    const secret = "oisjcfnjdhr7238q9ufh"
    return jwt.sign(payload,secret)
}