const expense = require('./../models/expense');
const user = require('./../models/user');

const tokenVerify = require("./../util/helpers")

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


/*function generateToken(id,email){
    const payload = {
        id : id ,
        email : email
    }
    const secret = "oisjcfnjdhr7238q9ufh"
    return jwt.sign(payload,secret)
}
*/



exports.userlogin = async (req,res,next) => { 
    const email = req.body.email;
    const password = req.body.password;
    try {
        const requested_user = await user.findOne({where : {email : email}}) 
        if(!requested_user){
            return res.json({message : 'user not found'})
        }

        const ismatch = await bcrypt.compare(password, requested_user.password);
        console.log(ismatch)
        if(ismatch){
            const usertoken = tokenVerify.generateToken(requested_user.id,requested_user.email,requested_user.premium); 
            res.json({message : 'login successful', token : usertoken})
        }
        else {
            return res.json({message: 'password mismatch'})
        }
    }
    catch(err) {
        res.json({message : 'some error occured at backend'})
        console.log(err)
    }
}

exports.add_expense = async (req,res,next) => {
    const data = req.body
    const token = req.body.userId
    try{
        const decoded = await tokenVerify.verifyToken(token)

        const userId = decoded.id; 

        data.userId = userId;

        console.log(data)

        const new_expense = await expense.create(data);
        console.log(new_expense)
        res.status(200).json({message : "data added successfully"})
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : 'error in creating a new expense',err})
        }    } 

exports.get_expense =  async (req,res,next) => {
    const token = req.headers.authorisation;

    try{
        const decoded = await tokenVerify.verifyToken(token)
        console.log(decoded)

        const userId = decoded.id;  

        const userToFetch  = await user.findByPk(userId);

        const expenses = await userToFetch.getExpenses();

        expenses.forEach((element,index) => {
            expenses[index].dataValues.id = "confidential" ;
            expenses[index].dataValues.userId = "confidential"
        });

        res.json({expenses,premium: decoded.premium})

    }
    catch(err){
        console.log(err)
        res.json({msg : 'check backend'})
    }
    } 

exports.deleteUser = async (req,res,next)=>{
    const token = req.body.token;
    const expenseId = req.body.id;
    try{
        const decoded = await tokenVerify.verifyToken(token)

        const userId = decoded.id; 

        const userToFetch  = await user.findByPk(userId);

        const expense = await userToFetch.getExpenses(
            {where: {
            id: expenseId  
            }} 
        );

        const dlt_result = await expense[0].destroy()

        console.log(dlt_result)

        res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        console.log(err)
        res.status(500).json({msg : 'delete op error'})
        }
}



