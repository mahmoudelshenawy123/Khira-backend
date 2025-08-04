const mongoose = require('mongoose');

const CategoriesSchema = mongoose.Schema({
  translation: {
    en: {
      title: {
        type: String,
        required: [true, 'Category English Title is required'],
      },
    },
    ar: {
      title: {
        type: String,
        required: [true, 'Category Arabic Title is required'],
      },
    },
    ur: {
      title: {
        type: String,
        required: [true, 'Category Urdu Title is required'],
      },
    },
  },
  image: {
    type: String,
    required: [true, 'Category Image is required'],
  },

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.Categories = mongoose.model('Category', CategoriesSchema);
