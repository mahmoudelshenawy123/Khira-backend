const mongoose = require('mongoose');

const CartSchema = mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product Id Is Required'],
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required:[true,'User Id Is Required']
  },
  quantity:{
    type: Number,
    required: [true, 'User Id Is Required'],
  },
  unique_identifier:{
    type: String,
    default:'',
    required: [true, 'User Unique Identifier Is Required'],
  },
  selected_size_id:{
    type: String,
  },
  is_gift: {
    type: Boolean,
    default:false,
  },
  send_receipt: {
    type: Boolean,
    default:false,
  },
  greeting_card: {
    type: Boolean,
    default:false,
  },
  greeting_card_message: {
    type: String,
    default:'',
  },


}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.Cart = mongoose.model('Cart', CartSchema);
