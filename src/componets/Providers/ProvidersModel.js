const mongoose = require('mongoose');

const ProvidersSchema = mongoose.Schema({
  store_name: {
    type: String,
    required: [true, 'Store Name Is required'],
    // default:''
  },
  owner_name: {
    type: String,
    required: [true, 'Owner Name Is required'],
    // default:''
  },
  email: {
    type: String,
    required: 'Store Email Is Required',
    unique: [true, 'Email alredy exists'],
  },
  phone_number: {
    type: String,
    required: 'Store phone Is Required',
    // unique:[true,'Phone alredy exists']
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'City Id Is Required'],
  },
  neighborhood_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Neighborhood',
    required: [true, 'Neighborhood Id Is Required'],
  },
  category_id: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
    required: [true, 'Category Id Is Required'],
  },
  current_latitude: {
    type: String,
    required: [true, 'Address latitude Is Required'],
  },
  current_longitude: {
    type: String,
    required: [true, 'Address longitude Is Required'],
  },
  address:{
    en:{
      type: String,
      required: [true, 'Address longitude Is Required'],
    },
    ar:{
      type: String,
      required: [true, 'Address longitude Is Required'],
    },
  },
  id_number: {
    type: String,
    required: [true, 'Id Number Is Required'],
  },
  commercial_registeration_number: {
    type: String,
    required: [true, 'Commercial Registeration Number Is Required'],
  },
  has_special_requests: {
    type: Number,
    enum: [1, 2], // 1 has special requests || 2 doesn't have special requests
    required: [true, 'Has Special Requests Is Required'],
  },
  verififed_code: {
    code: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    expires_date: {
      type: Date,
      default: new Date(+new Date() + 1 * 24 * 60 * 60 * 1000),
    },
  },
  whatsapp_number: {
    type: String,
    default: '',
  },
  personal_photo: {
    type: String,
    required: 'Personal Photo Is Required',
  },
  firebase_token: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
  api_token: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  total_rate: {
    type: Number,
    default: 0,
  },
  total_rate_number: {
    type: Number,
    default: 0,
  },
  total_rate_count: {
    type: Number,
    default: 0,
  },
  rates: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id Is Required'],
      },
      rate: {
        type: Number,
        max: [5, 'Rate maximum Number Is 5'],
        min: [1, 'Rate Minimun Number Is 5'],
        default: 1,
      },
      content: {
        type: String,
        required: [true, 'Rate Content Is Required'],
      },
    },
  ],
  stories: [{
    story_image: {
      type: String,
      required: [true, 'Story Image Is Required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  current_language: {
    type: String,
    enum: ['en', 'ar', 'ur'],
    default: 'ar',
  },
  status: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
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

module.exports.Providers = mongoose.model('Provider', ProvidersSchema);
