const { City } = require('./CititesModel');

exports.AddCity =async(data)=>{
  try {
    let addedCity = await City.create(data)
    return addedCity;
  } catch (error) {
    throw error
  }
}

exports.UpdateCity =async(id,data)=>{
  try {
    let addedCity = await City.findByIdAndUpdate(id,data)
    return addedCity;
  } catch (error) {
    throw error
  }
}

exports.GetCityById =async(id)=>{
  try {
    let city = await City.findById(id).lean()
    return city;
  } catch (error) {
    throw error
  }
}

exports.GetCitiesCount =async()=>{
  try {
    let cities = await City.find().lean().count()
    return cities;
  } catch (error) {
    throw error
  }
}

exports.GetAllCities =async()=>{
  try {
    let cities = await City.find({}).lean()
    return cities;
  } catch (error) {
    throw error
  }
}

exports.GetAllCitiesPaginated =async(page,itemPerPage)=>{
  try {
    let cities = await City.find({}).lean().sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
    return cities;
  } catch (error) {
    throw error
  }
}

exports.DeleteCity =async(id)=>{
  try {
    let city = await City.findByIdAndDelete(id)
    return city;
  } catch (error) {
    throw error
  }
}