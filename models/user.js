const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  totalExpense: {
    type: Number, // Sequelize.FLOAT maps to Number in Mongoose
    required: true,
    default: 0,
  },
  premium: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Virtual field for `expenses`
userSchema.virtual('expenses', {
  ref: 'Expense', // Reference to Expense model
  localField: '_id', // Local field in User schema
  foreignField: 'user', // Field in Expense schema that references User
});

// Virtual field for `forgotPasswords`
userSchema.virtual('forgotPasswords', {
  ref: 'ForgotPassword', // Reference to ForgotPassword model
  localField: '_id', // Local field in User schema
  foreignField: 'user', // Field in ForgotPassword schema that references User
});

// Export the Mongoose model
module.exports = mongoose.model('User', userSchema);
