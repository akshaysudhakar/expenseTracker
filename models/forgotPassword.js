const mongoose = require('mongoose');

const schema = mongoose.Schema;

const forgotPasswordSchema = new schema({
  id: {
    type: String, // Use String for UUID
    default: () => require('uuid').v4(), // Generates UUID using uuidv4
    unique: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  user: {
    type: schema.Types.ObjectId, // Reference to User model
    ref: 'User', // 'User' is the name of the User model
    required: true, // Ensuring the relationship is required
  },
});

// Export the Mongoose model
module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema);

