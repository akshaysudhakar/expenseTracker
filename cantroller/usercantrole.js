const { Body } = require('sib-api-v3-sdk');
const expense = require('./../models/expense');
const user = require('./../models/user');
const sequelise = require("./../util/database")
const tokenVerify = require("./../util/helpers")
const AWS = require('aws-sdk');


//const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function uploadToS3(data,filename){
    return new Promise((resolve,reject)=>{
        const BUCKET_NAME = 'akshayexpensetracker'
    const IAM_USER_KEY = process.env.AMAZON_ACCESS_KEY;
    const IAM_USER_SECRET =process.env.AMAZON_SECRET_ACCESS_KEY

    let s3Bucket = new AWS.S3({
        accessKeyId : IAM_USER_KEY,
        secretAccessKey : IAM_USER_SECRET
    } )

    s3Bucket.createBucket(()=>{
        var params = {
            Bucket : BUCKET_NAME,
            Key : filename,
            Body : data,
            ACL : 'public-read'
        }
        s3Bucket.upload(params, (err, s3response)=>{
            if(err){
                console.log("not successfull",err)
                reject(err)
            }
            else{
                console.log("success",s3response)
                resolve(s3response.Location)
            }
        })
    })
    })
    
}




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
    let t;
    try{
        t = await  sequelise.transaction();

        const decoded = await tokenVerify.verifyToken(token)

        const userId = decoded.id; 

        data.userId = userId;

        await expense.create(data,{transaction : t});

        const userToAdd = await user.findByPk(userId,{transaction : t});
        
        const newTotalExpense  = userToAdd.totalExpense + parseFloat(data.expense);

        userToAdd.totalExpense = newTotalExpense;

        await userToAdd.save({transaction : t});

        await t.commit()

        res.status(200).json({message : "data added successfully"})
        
    }
    catch(err){
        if(t){
            await t.rollback();
        }
        console.log(err);
        res.status(500).json({message : 'error in creating a new expense',err})
        }    } 

exports.get_expense =  async (req,res) => {
    const token = req.headers.authorisation;
    const pageNumber = parseInt(req.headers.pagenumber,10) || 1
    const rows = parseInt(req.headers.numofrows,10) || 5
    console.log(pageNumber)

    try{
        const decoded = await tokenVerify.verifyToken(token)
        console.log(decoded)

        const userId = decoded.id;  

        const userToFetch  = await user.findByPk(userId);

        const totalExpenses = await userToFetch.countExpenses();

        const expenses = await userToFetch.getExpenses(
            {
                offset : (pageNumber-1)*rows,
                limit : rows,
                attributes: { exclude: ['id', 'userId'] }
            } 
        );

        res.json({
            expenses,
            premium: decoded.premium,
            hasNextPage : totalExpenses > pageNumber*rows,
            hasPreviousPage : pageNumber >1,
            cPageNumber : pageNumber
        })

    }
    catch(err){
        console.log(err)
        res.json({msg : 'check backend'})
    }
    } 

exports.deleteUser = async (req,res,next)=>{
    const token = req.body.token;
    const expenseId = req.body.id;
    console.log("expense",expenseId);
    let t;
    try{
        t=  await sequelise.transaction();
        const decoded = await tokenVerify.verifyToken(token)

        const userId = decoded.id; 

        const userToFetch  = await user.findByPk(userId,{transaction : t});

        const expense = await userToFetch.getExpenses(
            {where: {
            id: expenseId  
            }},
            {transaction : t}
        );

        const newTotalExpense  = parseFloat(userToFetch.totalExpense) - parseFloat(expense[0].expense);

        await expense[0].destroy({transaction : t})

        userToFetch.totalExpense = parseFloat(newTotalExpense);

        await userToFetch.save({transaction : t})

        await t.commit()

        res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        if(t){
            await t.rollback()
        }
        console.log(err)
        res.status(500).json({msg : 'delete op error'})
        }
}

exports.downloadExpense = async(req,res)=>{
    const token = req.headers.authorization;
    try{
        const decoded = await tokenVerify.verifyToken(token)
        console.log(decoded)

        const userId = decoded.id;  

        const userToFetch  = await user.findByPk(userId);

        const expenses = await userToFetch.getExpenses();
        
        const stringifiedExpenses = JSON.stringify(expenses);

        const filename = `expense${userToFetch.id}/${new Date()}.txt`;

        const fileUrl = await uploadToS3(stringifiedExpenses,filename);

        res.status(201).json({fileUrl,success : true})

    }
    catch(err){
        console.log(err)
    }

}


