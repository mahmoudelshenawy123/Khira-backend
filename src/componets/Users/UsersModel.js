const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  password: {
    type: String,
  },
  phone_number: {
    type: String,
    // required: [true, 'User phone Is Required'],
    // unique:[true,'Phone alredy exists']
  },
  personal_photo: {
    type: String,
    default: '',
    // required:'Personal Photo Is Required',
  },
  email: {
    type: String,
    required: [true, 'Email Is Required'],
    unique:[true, 'Email Must Be Unique Required']
  },
  display_name: {
    type: String,
    // required: [true, 'Display Name Is Required'],
  },
  reset_password_key: {
    type: String,
    // required: [true, 'Display Name Is Required'],
  },
  current_language: {
    type: String,
    enum: ['en', 'ar', 'ur'],
    default: 'en',
  },
  favorited_products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
  },
  billing_address:{
    name:{
      type: String,
      // required: [true, 'Billing Address Name Is Required'],
    },
    city:{
      type: String,
      // required: [true, 'Billing Address City Is Required'],
    },
    street_address:{
      type: String,
      // required: [true, 'Billing Address Street ADdress Is Required'],
    },
    phone:{
      type: String,
      // required: [true, 'Billing Address Phone Is Required'],
    },
    email:{
      type: String,
    },
  },
  shipping_address:{
    name:{
      type: String,
      // required: [true, 'Shipping Address Name Is Required'],
    },
    city:{
      type: String,
      // required: [true, 'Shipping Address City Is Required'],
    },
    street_address:{
      type: String,
      // required: [true, 'Shipping Address Street ADdress Is Required'],
    },
    state:{
      type: String,
    },
  },
  status: {
    type: Number,
    enum: [1, 2, 3],
    default: 2,
    // 1 => initial status
    // 2 => Active
    // 3 => Block
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.User = mongoose.model('User', UserSchema);
