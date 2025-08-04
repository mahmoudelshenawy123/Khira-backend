const mongoose = require('mongoose');

const ProductReviewsSchema = mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product Id Is Required'],
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

module.exports.ProductReviews = mongoose.model('ProductReview', ProductReviewsSchema);
