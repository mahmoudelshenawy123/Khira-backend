const { UserNotification } = require('./UserNotificationsModel');
const { User } = require('./UsersModel');

exports.AddUser =async(data)=>{
  try {
    let addedUser = await User.create(data)
    return addedUser
  } catch (error) {
    throw error
  }
}

exports.UpdateUser =async(id,data)=>{
  try {
    let updatedUser = await User.findByIdAndUpdate(id,data,{new:true})
    return updatedUser
  } catch (error) {
    throw error
  }
}

exports.UpdateUserByQuery =async(query,data)=>{
  try {
    let updatedUser = await User.findOneAndUpdate(query,data,{new:true})
    return updatedUser
  } catch (error) {
    throw error
  }
}

exports.UpdateUserSession =async(id,data,session)=>{
  try {
    let updatedUser = await User.findByIdAndUpdate(id,data,{new:true,session})
    return updatedUser
  } catch (error) {
    throw error
  }
}

exports.GetUserByQuery =async(query)=>{
  try {
    let user = await User.findOne(query);
    return user
  } catch (error) {
    throw error
  }
}

exports.GetUserById =async(id)=>{
  try {
    let user = await User.findById(id)
    return user
  } catch (error) {
    throw error
  }
}

exports.GetUserByIdProductsPopulated =async(id)=>{
  try {
    let user = await User.findById(id).populate({path:'favorited_products',populate:{path:'reviews.user_id'}})
    return user
  } catch (error) {
    throw error
  }
}

exports.GetUsersCount =async(queryParams)=>{
  try {
    let userCount = await User.find(queryParams).count()
    return userCount
  } catch (error) {
    throw error
  }
}

exports.GetAllUsersPaginated =async(queryParams,page,itemPerPage)=>{
  try {
    let users = await User.find(queryParams).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
    return users
  } catch (error) {
    throw error
  }
}

exports.DeleteUser =async(userId)=>{
  try {
    let users = await User.findByIdAndDelete(userId)
    return users
  } catch (error) {
    throw error
  }
}

exports.AddUserNotification =async(data)=>{
  try {
      let addedUserNotification = await UserNotification.create(data)
      return addedUserNotification
  } catch (error) {
      throw error
  }
}

exports.GetUserNotification =async(query)=>{
  try {
      let userNotifications = await UserNotification.find(query)
      return userNotifications
  } catch (error) {
      throw error
  }
}