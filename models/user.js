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
  expenses :[{
    expense: {
      type: Number, 
      required: true,
    },
    category: {
      type: String, 
      required: true,
    },
    description: {
      type: String,
      required: true,
    }
  }]
}
);

// Virtual field for `forgotPasswords`
userSchema.virtual('forgotPasswords', {
  ref: 'ForgotPassword', // Reference to ForgotPassword model
  localField: '_id', // Local field in User schema
  foreignField: 'user', // Field in ForgotPassword schema that references User
});

// Export the Mongoose model
module.exports = mongoose.model('User', userSchema);
