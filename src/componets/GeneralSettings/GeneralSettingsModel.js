const mongoose = require('mongoose')

const GeneralSettingsSchema = mongoose.Schema(
  {
    is_project_In_factory_mode: {
      type: Number,
      enum: [1, 2],
      default: 1,
      // 1 => not in factory mode
      // 2 => in factory mode
    },
    is_online_payment_active: {
      type: Number,
      enum: [1, 2],
      default: 1,
      // 1 => active
      // 2 => deactive
    },
    is_cash_payment_active: {
      type: Number,
      enum: [1, 2],
      default: 1,
      // 1 => active
      // 2 => deactive
    },
    project_logo: {
      type: String,
      // required: [true, 'Project Logo Is Required'],
    },
    product_page_image: {
      type: String,
      // required: [true, 'Project Logo Is Required'],
    },
    project_main_background_color: {
      type: String,
      required: [true, 'Project Main Background Color Is Required'],
    },
    project_main_text_color: {
      type: String,
      required: [true, 'Project Main Text Color Is Required'],
    },
    project_whats_app_number: {
      type: String,
      // required:[true,'project whats app number is required'],
    },
    project_phone_number: {
      type: String,
      // required:[true,'project phone number is required'],
    },
    project_email_address: {
      type: String,
      // required:[true,'project email address is required'],
    },
    project_facebook_link: {
      type: String,
      // required:[true,'project facebook link is required'],
    },
    project_twitter_link: {
      type: String,
      // required:[true,'project twitter link is required'],
    },
    project_instagram_link: {
      type: String,
      // required:[true,'project facebook link is required'],
    },

    shipping_chargers: {
      type: Number,
      // required:[true,'additional_milage is required'],
    },
    shipping_prices: {
      type: Map,
      of: Number, // Cairo: 50, Giza: 40
      default: {},
    },
    wrap_as_gift_value: {
      type: Number,
      // required:[true,'additional_milage is required'],
    },
    vat_value: {
      type: Number,
      // required:[true,'vat_value is required'],
    },
    translation: {
      en: {
        homePageUpperText: {
          type: String,
          required: [true, 'homePageUpperText English content is required'],
        },
        homePageFooterText: {
          type: String,
          required: [true, 'homePageFooterText English content is required'],
        },
      },
      ar: {
        homePageUpperText: {
          type: String,
          required: [true, 'homePageUpperText Arabic content is required'],
        },
        homePageFooterText: {
          type: String,
          required: [true, 'homePageFooterText Arabic content is required'],
        },
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.GeneralSettings = mongoose.model(
  'GeneralSetting',
  GeneralSettingsSchema
)
