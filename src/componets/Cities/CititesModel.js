const mongoose = require('mongoose');

const CitySchema = mongoose.Schema({
  translation: {
    en: {
      name: {
        type: String,
        required: [true, 'City English name is required'],
      },
    },
    ar: {
      name: {
        type: String,
        required: [true, 'City Arabic name is required'],
      },
    },
    ur: {
      name: {
        type: String,
        required: [true, 'City Urdu name is required'],
      },
    },
  },

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.City = mongoose.model('City', CitySchema);
