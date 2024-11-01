const expense = require('./../models/expense');
const user = require('./../models/user');
const sequelise = require("./../util/database")
const tokenVerify = require("../util/helpers")




const bcrypt = require('bcrypt');





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
    let t;
    const userId = req.user.id; 
    try{
        t = await  sequelise.transaction();

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
                attributes: { exclude: ['userId'] }
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
    const expenseId = req.body.id;
    const userId = req.user.id;
    console.log("expense",expenseId);
    let t;
    try{
        t=  await sequelise.transaction();

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




