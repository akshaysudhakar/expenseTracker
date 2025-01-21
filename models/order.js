const mongoose = require('mongoose');

const schema = mongoose.Schema;

const orderSchema = new schema({
  amount: {
    type: Number, // INTEGER maps to Number in Mongoose
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  user: {
    type: schema.Types.ObjectId, // Reference to the User model
    ref: 'User', // 'User' is the name of the User model
    required: true, // Ensuring the relationship is required
  },
});

// Export the Mongoose model
module.exports = mongoose.model('Order', orderSchema);

