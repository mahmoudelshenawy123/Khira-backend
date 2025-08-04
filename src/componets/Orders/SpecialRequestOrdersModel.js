const mongoose = require('mongoose');

const SpecialRequestOrdersSchema = mongoose.Schema({
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
  special_request_audio_file: {
    type: String,
    required: [true, 'Special Request Order Audio File Is Required'],
  },
  special_request_offer: {
    type: Number,
  },
  messages: [
    {
      message_type: {
        type: Number,
        enum: [1, 2, 3],
        required: [true, 'Message Type Is Required'],
        // 1 => message is string
        // 2 => message is image
        // 3 => message is audio
      },
      sender:{
        type: String,
        enum: ['provider','user']
      },
      message: {
        type: String,
        // required:[true,'Special Request Order Audio File Is Required']
      },
      uploaded_message_file: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
    // 1 => order Active
    // 2 => order Accepted
    // 3 => order canceled
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.SpecialRequestOrders = mongoose.model('SpecialRequestOrder', SpecialRequestOrdersSchema);
