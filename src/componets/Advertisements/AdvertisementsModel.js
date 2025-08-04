const mongoose = require('mongoose');

const AdvertisementsSchema = mongoose.Schema({
  background_image: {
    type: String,
    required: [true, 'Advertisement background image is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  link: {
    type: String,
    // required:[true,'Advertisement Order Link is required']
  },
  type: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: [true, 'Advertisement Type is required'],
    // 1 => Normal
    // 2 => Has Link
    // 3 => Has id To Provider
    // 4 => Has Id To Product
  },
  translation: {
    en: {
      title: {
        type: String,
        required: [true, 'Advertisement English Title is required'],
      },
      description: {
        type: String,
        required: [true, 'Advertisement English Description is required'],
      },
    },
    ar: {
      title: {
        type: String,
        required: [true, 'Advertisement Arabic Title is required'],
      },
      description: {
        type: String,
        required: [true, 'Advertisement Arabic Description is required'],
      },
    },
    ur: {
      title: {
        type: String,
        required: [true, 'Advertisement Urdu Title is required'],
      },
      description: {
        type: String,
        required: [true, 'Advertisement Urdu Description is required'],
      },
    },
  },

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.Advertisements = mongoose.model('Advertisement', AdvertisementsSchema);
