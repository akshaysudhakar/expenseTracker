const expense_model = require('./../models/expense');

exports.add_expense = (req,res,next) => {
    const data = req.body
    expense_model.create(data)
    .then(response => {console.log(response)
                res.json({data})
    })
    .catch(err => {console.log("could not upload",err)
        res.json({message : "data could not be ploaded to database"})
    })
}

exports.get_expense = async (req,res,next) => {
    try{
        const expense_table = await expense_model.findAll();
        res.json(expense_table)
    }
    catch(err){
        console.log(err)
        res.json({error:err})
    }
}