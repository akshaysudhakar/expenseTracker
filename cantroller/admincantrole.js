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

