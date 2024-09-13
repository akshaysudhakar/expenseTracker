const usermodel = require('./../models/user');
const bcrypt = require('bcrypt');

exports.addUser = async (req, res, next) => {
    const data = req.body;
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        data.password = hashedPassword;

        const newUser = await usermodel.create(data);
        
        console.log('Successfully added a new user');
        res.redirect('/form1.html');

    } 
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.json({ message: "This email already exists" });
        } else {
            console.error('Error during user creation:', err);

            res.status(500).json({ message: "An error occurred while adding the user." });
        }
    }
};

exports.userlogin = async (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await usermodel.findOne({where : {email : email}}) 
        if(!user){
            return res.json({message : 'user not found'})
        }

        const ismatch = await bcrypt.compare(password, user.password);
        console.log(ismatch)
        if(ismatch){
            res.send(
            `<html>
            <body>
                <script>
                alert('User logged in successfully');
                window.location.href = '/form2.html'; // Redirect after the alert
                </script>
            </body>
        </html>`
            )
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