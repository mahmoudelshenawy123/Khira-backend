const mongoose = require('mongoose')

const ProductsSchema = mongoose.Schema(
  {
    translation: {
      en: {
        title: {
          type: String,
          required: [true, 'Product English title is required'],
          unique: true,
        },
        description: {
          type: String,
          // required: [true, 'Product English description is required'],
        },
      },
      ar: {
        title: {
          type: String,
          required: [true, 'Product Arabic title is required'],
        },
        description: {
          type: String,
          // required: [true, 'Product Arabic description is required'],
        },
      },
    },
    sizes: [
      {
        title: {
          en: {
            type: String,
            required: [true, 'Product Size Title English Is Required'],
          },
          ar: {
            type: String,
            required: [true, 'Product Size Title Arabic Is Required'],
          },
        },
        price: {
          type: Number,
          required: [true, 'Product Size Price Is Required'],
        },
      },
    ],
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category Id Is Required'],
    },
    price: {
      type: Number,
      required: [true, 'Product Price Is Required'],
    },
    image: {
      type: String,
      required: [true, 'Product Main Image Is Required'],
    },
    slug: {
      type: String,
      required: [true, 'Product Slug Is Required'],
    },
    images: {
      type: [String],
      // required: [true, 'Product Images Is Required'],
    },
    status: {
      type: Number,
      enum: [1, 2],
      default: 1,
      // 1 => Product active
      // 2 => Product Blocked
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.Products = mongoose.model('Product', ProductsSchema)
