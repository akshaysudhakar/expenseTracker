const Expense = require('./../models/expense');
const User = require('./../models/user');
const sequelise = require("./../util/database")
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
    const userId = req.user.id;
    try {
        // Start a session
        session = await mongoose.startSession();
        session.startTransaction();

        data.user = userId;

        // Create a new Expense document
        const expense = new Expense(data);
        await expense.save({ session });  // Save with session

        // Update the user's total expense
        const user = await User.findById(userId).session(session);  // Use the session here as well
        const newTotalExpense = user.totalExpense + parseFloat(data.expense);
        user.totalExpense = newTotalExpense;

        await user.save({ session });  // Save with session

        // Commit the transaction
        await session.commitTransaction();
        res.status(200).json({ message: 'Expense added successfully' });

    } catch (err) {
        // If an error occurs, rollback the transaction
        if (session) {
            await session.abortTransaction();
        }
        console.log(err);
        res.status(500).json({ message: 'Error in creating a new expense', err });
    } finally {
        // End the session after the transaction is completed or aborted
        if (session) {
            session.endSession();
        }
    }
};

exports.get_expense =  async (req,res) => {
    const userId = req.user.id; 
    const pageNumber = parseInt(req.headers.pagenumber,10) || 1
    const rows = parseInt(req.headers.numofrows,10) || 5
    console.log(pageNumber)

    try{ 

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




