const { Sequelize } = require('sequelize');
const User = require('./../models/user');
const AWS = require('aws-sdk');



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


exports.leaderBoard = async (req, res, next) => {
    try {
        const userExpenses = await User.find(
            {},
            {name : 1, totalExpense : 1 , _id : -1},
            {sort : {totalExpense : -1}}
        );

        res.json(userExpenses);
    } 
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }
};


exports.downloadExpense = async(req,res)=>{
    try{
        const expenses = req.user.expenses;
        
        const stringifiedExpenses = JSON.stringify(expenses);

        const filename = `expense${req.user.id}/${new Date()}.txt`;

        const fileUrl = await uploadToS3(stringifiedExpenses,filename);

        res.status(201).json({fileUrl,success : true})

    }
    catch(err){
        console.log(err)
    }
}