const {
  ResponseSchema,
  MergeImageLink,
  SplitImageLink,
} = require('../../helper/HelperFunctions')
const { ErrorHandler } = require('../../helper/ErrorHandler')
const {
  GetGeneralSettings,
  AddGeneralSettings,
  UpdateGeneralSettings,
} = require('./GeneralSettingsService')

exports.updateSettings = async (req, res) => {
  const {
    is_project_In_factory_mode,
    is_online_payment_active,
    is_cash_payment_active,
    project_main_background_color,
    project_main_text_color,
    project_whats_app_number,
    project_phone_number,
    project_email_address,
    project_facebook_link,
    wrap_as_gift_value,
    project_twitter_link,
    project_instagram_link,
    shipping_chargers,
    vat_value,
    project_logo: project_logo_body,

    shipping_prices,
    // new translation fields
    homePageUpperText_en,
    homePageFooterText_en,
    homePageUpperText_ar,
    homePageFooterText_ar,
  } = req.body

  const { project_logo, product_page_image } = req.files

  const generalSetting = await GetGeneralSettings()

  let addedData = {
    id: 1,
    project_logo: project_logo?.[0]
      ? project_logo?.[0]?.filename
      : project_logo_body
      ? SplitImageLink(req, project_logo_body)
      : '',

    product_page_image: product_page_image?.[0]
      ? product_page_image?.[0]?.filename
      : req.body.product_page_image
      ? SplitImageLink(req, req.body.product_page_image)
      : '',
    shipping_prices: shipping_prices ? JSON.parse(shipping_prices) : {},
    is_project_In_factory_mode,
    is_online_payment_active,
    is_cash_payment_active,
    project_main_background_color,
    project_main_text_color,
    project_whats_app_number,
    project_phone_number,
    project_email_address,
    project_facebook_link,
    project_twitter_link,
    project_instagram_link,
    shipping_chargers,
    wrap_as_gift_value,
    vat_value,

    // nested translation
    'translation.en.homePageUpperText': homePageUpperText_en,
    'translation.en.homePageFooterText': homePageFooterText_en,
    'translation.ar.homePageUpperText': homePageUpperText_ar,
    'translation.ar.homePageFooterText': homePageFooterText_ar,
  }

  try {
    if (!generalSetting) {
      await AddGeneralSettings(addedData)
    } else {
      await UpdateGeneralSettings(addedData)
    }
    return res
      .status(201)
      .json(ResponseSchema(req.t('Settings Updated Successfully'), true))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Something went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.getSettings = async (req, res) => {
  const lang = req.headers['accept-language'] || 'en'
  try {
    const generalSetting = await GetGeneralSettings()
    const sendedObject = {
      project_logo: generalSetting?.project_logo
        ? MergeImageLink(req, generalSetting?.project_logo)
        : '',
      product_page_image: generalSetting?.product_page_image
        ? MergeImageLink(req, generalSetting?.product_page_image)
        : '',
      is_project_In_factory_mode: generalSetting?.is_project_In_factory_mode,
      is_online_payment_active: generalSetting?.is_online_payment_active,
      is_cash_payment_active: generalSetting?.is_cash_payment_active,
      project_main_background_color:
        generalSetting?.project_main_background_color,
      project_main_text_color: generalSetting?.project_main_text_color,
      project_whats_app_number: generalSetting?.project_whats_app_number,
      project_phone_number: generalSetting?.project_phone_number,
      project_email_address: generalSetting?.project_email_address,
      project_facebook_link: generalSetting?.project_facebook_link,
      project_twitter_link: generalSetting?.project_twitter_link,
      project_instagram_link: generalSetting?.project_instagram_link,
      shipping_chargers: generalSetting?.shipping_chargers,
      wrap_as_gift_value: generalSetting?.wrap_as_gift_value,
      vat_value: generalSetting?.vat_value,
      shipping_prices: generalSetting?.shipping_prices || {},

      // translated values
      homePageUpperText:
        generalSetting?.translation?.[lang]?.homePageUpperText || '',
      homePageFooterText:
        generalSetting?.translation?.[lang]?.homePageFooterText || '',
      // expose all translations
      homePageUpperText_en:
        generalSetting?.translation?.en?.homePageUpperText || '',
      homePageFooterText_en:
        generalSetting?.translation?.en?.homePageFooterText || '',
      homePageUpperText_ar:
        generalSetting?.translation?.ar?.homePageUpperText || '',
      homePageFooterText_ar:
        generalSetting?.translation?.ar?.homePageFooterText || '',
    }

    return res
      .status(200)
      .json(ResponseSchema(req.t('Settings'), true, sendedObject))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Something went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.getSettingsAll = async (req, res) => {
  try {
    const generalSetting = await GetGeneralSettings()
    const sendedObject = {
      project_logo: generalSetting?.project_logo
        ? MergeImageLink(req, generalSetting?.project_logo)
        : '',
      product_page_image: generalSetting?.product_page_image
        ? MergeImageLink(req, generalSetting?.product_page_image)
        : '',
      is_project_In_factory_mode: generalSetting?.is_project_In_factory_mode,
      is_online_payment_active: generalSetting?.is_online_payment_active,
      is_cash_payment_active: generalSetting?.is_cash_payment_active,
      project_main_background_color:
        generalSetting?.project_main_background_color,
      project_main_text_color: generalSetting?.project_main_text_color,
      project_whats_app_number: generalSetting?.project_whats_app_number,
      project_phone_number: generalSetting?.project_phone_number,
      project_email_address: generalSetting?.project_email_address,
      project_facebook_link: generalSetting?.project_facebook_link,
      project_twitter_link: generalSetting?.project_twitter_link,
      project_instagram_link: generalSetting?.project_instagram_link,
      shipping_chargers: generalSetting?.shipping_chargers,
      wrap_as_gift_value: generalSetting?.wrap_as_gift_value,
      vat_value: generalSetting?.vat_value,

      // expose all translations
      homePageUpperText_en:
        generalSetting?.translation?.en?.homePageUpperText || '',
      homePageFooterText_en:
        generalSetting?.translation?.en?.homePageFooterText || '',
      homePageUpperText_ar:
        generalSetting?.translation?.ar?.homePageUpperText || '',
      homePageFooterText_ar:
        generalSetting?.translation?.ar?.homePageFooterText || '',
    }

    return res
      .status(200)
      .json(ResponseSchema(req.t('Settings'), true, sendedObject))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Something went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}
