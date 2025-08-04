const { StaticPages } = require('./StaticPagesModel');

exports.AddStaticPage =async(data)=>{
  try {
    let addedStaticPage = await StaticPages.create(data)
    return addedStaticPage
  } catch (error) {
    throw error
  }
}

exports.UpdateStaticPage =async(data)=>{
  try {
    let updateStaticPage = await StaticPages.findOneAndUpdate({ id: 1 }, data)
    return updateStaticPage
  } catch (error) {
    throw error
  }
}

exports.GetStaticPage =async(data)=>{
  try {
    let staticPage = await StaticPages.findOne({ id: 1 })
    return staticPage
  } catch (error) {
    throw error
  }
}