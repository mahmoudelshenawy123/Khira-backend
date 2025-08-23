const mongoose = require('mongoose')

const SlidersSchema = mongoose.Schema(
  {
    translation: {
      en: {
        title: {
          type: String,
          required: [true, 'Slider English Title is required'],
        },
        description: {
          type: String,
          required: [true, 'Slider English description is required'],
        },
      },
      ar: {
        title: {
          type: String,
          required: [true, 'Slider Arabic Title is required'],
        },
        description: {
          type: String,
          required: [true, 'Slider Arabic description is required'],
        },
      },
    },
    // service_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Service',
    //   required: [true, 'Service Id Is Required'],
    // },
    image: {
      type: String,
      required: [true, 'Slider Image is required'],
    },
    order_number: {
      type: Number,
      required: [true, 'Slider order Number is required'],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.Sliders = mongoose.model('Slider', SlidersSchema)
