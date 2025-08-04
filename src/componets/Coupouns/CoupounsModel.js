const mongoose = require('mongoose');

const CoupounsSchema = mongoose.Schema({
  code:{
    type:String,
    required: [true, 'Coupoun Code is required'],
  },
  discount:{
    type:Number,
    required: [true, 'Coupoun Discount is required'],
  },
  status:{
    type:Number,
    enum:[1,2],
    required: [true, 'Coupoun Discount is required'],
    default:1,
    //  1=> active
    //  2=> Blocked
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.Coupouns = mongoose.model('Coupoun', CoupounsSchema);
