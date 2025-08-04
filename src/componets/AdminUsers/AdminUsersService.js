const { AdminUsers } = require('./AdminUsersModel');
const bcrypt = require('bcrypt');

exports.AddAdminUser = async (data) => {
  const {name, email , password} = data
  try{
    let addedUser =  await AdminUsers.create({
      name: name,
      email: email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
      status: 1,
    })
    return addedUser
}catch(err){
  throw (err) 
}
};

exports.GetAdminUserById = async (id) => {
  try{
    let user = await AdminUsers.findById(id)
    return user
  }catch(err){
    throw (err) 
  }
};

exports.GetOneAdminByEmail = async (email) => {
  try{
    let user = await AdminUsers.findOne({ email });
    return user
  }catch(err){
    throw (err) 
  }
};

exports.GetAllAdminUserPaginated = async (query) => {
  const { page , itemPerPage} = query ||{}
  try{
    let users = await AdminUsers.find({}).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage);
    return users
  }catch(err){
    throw (err) 
  }
};

exports.GetAllAdminUserCount = async () => {
  try{
    let usersCpunt = await AdminUsers.find().count()
    return usersCpunt
  }catch(err){
    throw (err) 
  }
};

exports.UpdateAdminUser = async (id,data) => {
  try{
    let updatedAdminUser = await AdminUsers.findByIdAndUpdate(id, data)
    return updatedAdminUser
  }catch(err){
    throw (err) 
  }
};

exports.UpdateAdminUserStatus = async (id,user) => {
  try{
    let updatedAdminUser = await AdminUsers.findByIdAndUpdate(id, {
      status: user?.status == 1 ? 2 : 1,
    })
    return updatedAdminUser
  }catch(err){
    throw (err) 
  }
};

exports.DeleteAdminUser = async (id) => {
  try{
    let deletedAdminUser = await AdminUsers.findByIdAndDelete(id)
    return deletedAdminUser
  }catch(err){
    throw (err) 
  }
};