const expense = require('./../models/expense');
const user = require('./../models/user');

exports.leaderBoard = async (req,res,next) =>{
    try{
        const users = await user.findAll()

        const userExpenses = await Promise.all(users.map(async (element) => {
            try{
                userId = element.dataValues.id;
                const User = await user.findByPk(userId)    
                const expenses = await User.getExpenses();
                let Expense  = 0
                expenses.forEach(element=> {
                    Expense+=element.dataValues.expense
                })
                return {[User.name] : Expense}
            }
            catch(err){
                console.log("error inside forloop", err);
            }
        })) 


        const sortedUserExpenses = userExpenses.sort((a, b) => {
            const valueA = Object.values(a)[0];
            const valueB = Object.values(b)[0];
            return valueA - valueB;
          });

        res.json(sortedUserExpenses)
    }
    catch(err){
        console.log(err)
    }
}