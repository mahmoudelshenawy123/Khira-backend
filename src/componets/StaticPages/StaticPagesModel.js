const mongoose = require('mongoose');

const StaticPagesSchema = mongoose.Schema({
  translation: {
    en: {
      terms_and_conditionds: {
        type: String,
        required: [true, 'Terms And Conditions English content is required'],
      },
      privacy: {
        type: String,
        required: [true, 'About Us English content is required'],
      },
    },
    ar: {
      terms_and_conditionds: {
        type: String,
        required: [true, 'Terms And Conditions Arabic content is required'],
      },
      privacy: {
        type: String,
        required: [true, 'About Us Arabic content is required'],
      },
    },
  },

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.StaticPages = mongoose.model('StaticPage', StaticPagesSchema);
