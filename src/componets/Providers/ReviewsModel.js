const mongoose = require('mongoose');

const ReviewsSchema = mongoose.Schema({
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider Id Is Required'],
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User Id Is Required'],
  },
  rate: {
    type: Number,
    required: [true, 'Review rate Is Required'],
  },
  content: {
    type: String,
    required: [true, 'Review content Is Required'],
  },
  status: {
    type: Number,
    enum: [1, 2],
    default: 1,
    // 1 => Product active
    // 2 => Product Blocked
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.Reviews = mongoose.model('Review', ReviewsSchema);
