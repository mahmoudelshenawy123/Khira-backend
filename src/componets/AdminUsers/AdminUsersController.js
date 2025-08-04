const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { AdminUsers } = require('./AdminUsersModel');
const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const { ResponseSchema, PaginateSchema } = require('../../helper/HelperFunctions');
const { Orders } = require('../Orders/OrdersModel');
const { User } = require('../Users/UsersModel');
const { AddAdminUser, GetAdminUserById, UpdateAdminUser, UpdateAdminUserStatus, GetOneAdminByEmail, GetAllAdminUserPaginated, GetAllAdminUserCount, DeleteAdminUser } = require('./AdminUsersService');

exports.createUser = async (req, res) => {
  const data = req.body;
  try{
    await AddAdminUser(data)
    return res.status(201).json(ResponseSchema(req.t('User Added Successfully'), true))
  }catch(err){
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.updateUser = async (req, res) => {
  const data = req.body;
  const { id } = req.params

  if (!CheckValidIdObject(req, res, id, req.t('User Id is Invalid'))) return;
  const user = await GetAdminUserById(id);

  if (!user) {
    return res.status(404).json(ResponseSchema(req.t("User Doesn't exist"), false));
  }
  let updatedData = {
    name: data.name,
    email: data.email,
  };

  if (data.password) {
    updatedData = {
      ...updatedData,
      password: bcrypt.hashSync(data.password, bcrypt.genSaltSync()),
    };
  }
  try{
    await UpdateAdminUser(id, updatedData)
    return res.status(201).json(ResponseSchema(req.t('User Updated Successfully'), true))
  }catch(err){
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.changeUserStatus = async (req, res) => {
  const { id }= req.params
  if (!CheckValidIdObject(req, res, id, req.t('User Id is Invalid'))) return;
  const user = await GetAdminUserById(id);
  
  if (!user) {
    return res.status(400).json(ResponseSchema(req.t('User Id is wrong'), false));
  }
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
  const userId = jwt.decode(token);

  if (userId?.user._id == id) {
    return res.status(400).json(ResponseSchema(req.t("User Can't Change Status Of himself"), false));
  }
  try{
    await UpdateAdminUserStatus(id ,user)
    return res.status(201).json(ResponseSchema(req.t('User Status Changed Successfully.'), true))
  }catch(err){
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(err)))
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await GetOneAdminByEmail(email);
  const { password:userPassword , status , is_admin} = user

  if (!user) {
    return res.status(400).json(ResponseSchema(req.t("Email Doesn't exist"), false));
  }
  if (bcrypt.compareSync(password, userPassword)) {
    if (status == 2) {
      return res.status(400).json(ResponseSchema(req.t('User Is Blocked'), false));
    }
    const token = jwt.sign({
      user,
      user_id:user?._id,
      isAdmin: is_admin,
      user_type:'admin'
    }, process.env.JWT_SECRET, { expiresIn: '20d' });

    return res.status(200).json(ResponseSchema(req.t('Login successfully'), true, token));
  }
  return res.status(400).json(ResponseSchema(req.t('Wrong user data'), false));
};

exports.getAllUsers = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetAllAdminUserCount();
  const pages = Math.ceil(count / itemPerPage);

  try{
    let users = await GetAllAdminUserPaginated({page,itemPerPage})
    let sendedObject = users.map((user) => ({
      id: user._id,
      name: user?.name,
      email: user?.email,
      password: user?.password,
      status: user.status,
    }));
    return res.status(200).json(ResponseSchema(req.t('Users'), true, PaginateSchema(page + 1, pages, count, sendedObject)));
  }catch(err){
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};
// 1 => order active
// 2 => order accepted
// 3 => order Completed
// 4 => order Canceled
exports.getStatistics = async (req, res) => {
  try {
    const allOrders = await Orders.find({}).count();
    const activeOrders = await Orders.find({ status: 1 }).count();
    const completedOrders = await Orders.find({ status: 3 }).count();
    const cancelledOrders = await Orders.find({ status: 5 }).count();

    const usersCount = await User.find({}).count();
    // const camelOwnerCount = await User.find({ user_type: 2 }).count();
    const sendedObject = {
      all_orders: allOrders,
      active_orders: activeOrders,
      complete_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      user_count: usersCount,
    };

    return res.status(200).json(ResponseSchema(req.t('Statistics'), true, sendedObject));
  } catch (err) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)));
  }
};

exports.deleteUser = async (req, res) => {
  const { id } =req.params
  if (!CheckValidIdObject(req, res, id, req.t('User Id is Invalid'))) return;
  const token = req?.headers?.authorization?.split(' ')[1];
  const userId = jwt.decode(token);

  if (userId?.user?._id == id) {
    return res.status(400).json(ResponseSchema(req.t("User Can't delete himself"), false));
  }
  try{
    let deletedUser = await DeleteAdminUser(id)
    return res.status(200).json(ResponseSchema(req.t('User deleted successfully'), true, deletedUser))
  }catch(err){
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};
