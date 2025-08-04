const { Coupouns } = require('./CoupounsModel');

exports.AddCoupoun=async(data)=>{
  try {
    let addedCoupoun = await Coupouns.create(data)
    return addedCoupoun
  } catch (error) {
    throw error
  }
}

exports.UpdateCoupoun=async(id,data)=>{
  try {
    let coupoun = await Coupouns.findByIdAndUpdate(id,data)
    return coupoun
  } catch (error) {
    throw error
  }
}

exports.GetCoupounsCount=async()=>{
  try {
    let coupounsCount = await Coupouns.find().lean().count()
    return coupounsCount
  } catch (error) {
    throw error
  }
}

exports.GetCoupounById=async(id)=>{
  try {
    let coupoun = await Coupouns.findById(id).lean()
    return coupoun
  } catch (error) {
    throw error
  }
}

exports.GetCoupounByQuery=async(query)=>{
  try {
    let coupoun = await Coupouns.find(query).lean()
    return coupoun
  } catch (error) {
    throw error
  }
}

exports.GetAllCoupouns=async()=>{
  try {
    let coupouns = await Coupouns.find({}).lean()
    return coupouns
  } catch (error) {
    throw error
  }
}

exports.GetAllCoupounsPaginated=async(page,itemPerPage)=>{
  try {
    let coupouns = await Coupouns.find({}).lean().sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
    return coupouns
  } catch (error) {
    throw error
  }
}

exports.DeleteCoupoun=async(id)=>{
  try {
    let deleteCoupoun = await Coupouns.findByIdAndDelete(id)
    return deleteCoupoun
  } catch (error) {
    throw error
  }
}