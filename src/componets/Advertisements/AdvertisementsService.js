const { Advertisements } = require('./AdvertisementsModel');

exports.AddAdvertisement = async(data) => {
  try{
    let addedAdvertisement = await Advertisements.create(data)
    return addedAdvertisement
  }catch(err){
    throw (err)
  }
};

exports.UpdateAdvertisement = async(id,data) => {
  try{
    let addedAdvertisement = await Advertisements.findByIdAndUpdate(id,data)
    return addedAdvertisement
  }catch(err){
    throw (err)
  }
};

exports.GetAdvertisementById = async(id) => {
  try{
    let advertisement = await Advertisements.findById(id)
    return advertisement
  }catch(err){
    throw (err)
  }
};

exports.GetAllAdvertisement = async(id) => {
  try{
    let advertisement = await Advertisements.find({})
    return advertisement
  }catch(err){
    throw (err)
  }
};

exports.GetAllAdvertisementPaginated = async(query) => {
  const { page , itemPerPage} = query ||{}
  try{
    let advertisements = await Advertisements.find({}).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage);
    return advertisements
  }catch(err){
    throw (err) 
  }
};

exports.DeleteAdvertisement = async(query) => {
  const { page , itemPerPage} = query ||{}
  try{
    let advertisements = await Advertisements.find({}).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage);
    return advertisements
  }catch(err){
    throw (err) 
  }
};