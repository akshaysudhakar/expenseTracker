const user = require('./../models/user');

exports.addUser= (req,res,next) => {
    const data  = req.body;
    user.create(data)
    .then(()=>{
        console.log('succesfull in adding a new user');
        res.redirect('/form1.html')
    })
    .catch(err => {
        if(err.name ==='SequelizeUniqueConstraintError')
            {
            res.json({message: "this email already exists"})
        }
})
}