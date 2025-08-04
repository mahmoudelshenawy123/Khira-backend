const {
  ResponseSchema,
  MergeImageLink,
  SplitImageLink,
} = require('../../helper/HelperFunctions')
const { ErrorHandler } = require('../../helper/ErrorHandler')
const { GeneralSettings } = require('./GeneralSettingsModel')
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
  } = req.body
  const { project_logo } = req.files

  const generalSetting = await GetGeneralSettings()
  let addedData = {
    id: 1,
    project_logo: project_logo?.[0]
      ? project_logo?.[0]?.filename
      : project_logo_body
      ? SplitImageLink(req, project_logo_body)
      : '',
    is_project_In_factory_mode: is_project_In_factory_mode,
    is_online_payment_active: is_online_payment_active,
    is_cash_payment_active: is_cash_payment_active,
    project_main_background_color: project_main_background_color,
    project_main_text_color: project_main_text_color,
    project_whats_app_number: project_whats_app_number,
    project_phone_number: project_phone_number,
    project_email_address: project_email_address,
    project_facebook_link: project_facebook_link,
    project_twitter_link: project_twitter_link,
    project_instagram_link: project_instagram_link,
    shipping_chargers: shipping_chargers,
    wrap_as_gift_value: wrap_as_gift_value,
    vat_value: vat_value,
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
          req.t('Somethings Went wrong'),
          true,
          ErrorHandler(error)
        )
      )
  }
}

exports.getSettings = async (req, res) => {
  try {
    const generalSetting = await GetGeneralSettings()
    const sendedObject = {
      project_logo: generalSetting?.project_logo
        ? MergeImageLink(req, generalSetting?.project_logo)
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
    }
    return res
      .status(200)
      .json(ResponseSchema(req.t('Settings'), true, sendedObject))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}
