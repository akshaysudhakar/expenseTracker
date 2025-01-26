const User = require('./../models/user');

const tokenVerify = require("../util/helpers")

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');





exports.userlogin = async (req,res,next) => { 
    const email = req.body.email;
    const password = req.body.password;
    try {
        const requested_user = await User.findOne({email}) 
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

exports.add_expense = async (req, res, next) => {
    const data = req.body;
    let session;
    try {
       
        req.user.expenses.push(data)

        req.user.totalExpense = req.user.totalExpense + parseFloat(data.expense);
        
        await req.user.save();  // Save with session

        res.status(200).json({ message: 'Expense added successfully' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error in creating a new expense', err });
    } 
};

exports.get_expense =  async (req,res) => {
    const userId = req.user.id; 
    const pageNumber = parseInt(req.headers.pagenumber,10) || 1
    const rows = parseInt(req.headers.numofrows,10) || 5

    try{ 

        const totalExpenses = req.user.expenses.length;

        const expenses = req.user.expenses.slice((pageNumber - 1) * rows, pageNumber * rows); 

        
        res.json({
            expenses,
            premium: req.user.premium,
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
    const expenseId = req.body.id;
    console.log("expense",expenseId);
    try{
        let expenseIndex

        expenseToDelete  =  req.user.expenses
        .find((exp,index) =>{
            if(exp._id.toString() === expenseId){
                expenseIndex = index;
                return true
        } 
        return false
        });

        req.user.totalExpense  = parseFloat(req.user.totalExpense) - parseFloat(expenseToDelete.expense);

        req.user.expenses.splice(expenseIndex,1)

        await req.user.save()

        res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        console.log(err)
        res.status(500).json({msg : 'delete op error'})
        }
}




