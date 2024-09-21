const { Sequelize } = require('sequelize');
const expense = require('./../models/expense');
const user = require('./../models/user');

exports.leaderBoard = async (req, res, next) => {
    try {
        const userExpenses = await user.findAll({
            include: [
                {
                    model: expense,
                    attributes: [] // No need to select any columns from expense table
                }
            ],
            attributes: [
                'name', 
                [Sequelize.fn('SUM', Sequelize.col('expenses.expense')), 'totalExpense']
            ],
            group: ['users.id'], // Group by user ID
            order: [[Sequelize.literal('totalExpense'), 'DESC']] // Sort by totalExpense
        });

        // Map the result to include only name and total expense
        const result = userExpenses.map(u => ({
            name: u.name,
            totalExpense: u.dataValues.totalExpense
        }));

        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }
};
