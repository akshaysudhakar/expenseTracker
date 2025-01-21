const mongoose = require('mongoose');

const schema = mongoose.Schema;

const expenseSchema = new schema({
  expense: {
    type: Number, // Use Number for storing doubles in Mongoose
    required: true,
  },
  category: {
    type: String, // Corrected the spelling from 'catogory' to 'category'
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: schema.Types.ObjectId, // Reference to User model
    ref: 'User', // 'User' is the name of the User model
    required: true, // Ensuring the relationship is required
  },
});

// Export the Mongoose model
module.exports = mongoose.model('Expense', expenseSchema);

