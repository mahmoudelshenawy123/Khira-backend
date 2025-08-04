const { GeneralSettings } = require('./GeneralSettingsModel');

exports.GetGeneralSettings = async ()=>{
  try {
    let generalSettings = await GeneralSettings.findOne({ id: 1 })
    return generalSettings
  } catch (error) {
    throw error
  }
}

exports.AddGeneralSettings = async (data)=>{
  try {
    let generalSettings = await GeneralSettings.create(data)
    return generalSettings
  } catch (error) {
    throw error
  }
}

exports.UpdateGeneralSettings = async (data)=>{
  try {
    let generalSettings = await GeneralSettings.findOneAndUpdate({ id: 1 },data)
    return generalSettings
  } catch (error) {
    throw error
  }
}