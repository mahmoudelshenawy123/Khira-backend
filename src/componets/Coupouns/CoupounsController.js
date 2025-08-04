const {
  ResponseSchema, PaginateSchema,
} = require('../../helper/HelperFunctions');
const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const { AddCoupoun, UpdateCoupoun, GetCoupounsCount, GetAllCoupouns, GetAllCoupounsPaginated, GetCoupounById, DeleteCoupoun, GetCoupounByQuery } = require('./CoupounsService');

exports.createCoupoun = async(req, res) => {
  const { status ,discount ,code} = req.body;
  const coupoun = await GetCoupounByQuery({code:code})
  if(coupoun){
    return res.status(201).json(ResponseSchema(req.t('Coupoun Already Exist'), true))
  }
    try {
    let addedData={
      code:code,
      discount:discount,
      status:status,
    }
    await AddCoupoun(addedData)
    return res.status(201).json(ResponseSchema(req.t('Coupoun Added Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)))
  }
};

exports.updateCoupoun = async (req, res) => {
  const { status ,discount ,code} = req.body;
  const { params:{id}} = req;

  if (!CheckValidIdObject(req, res, id, req.t('Coupoun Id is Invalid'))) return;

  const coupoun = await GetCoupounById(id);

  if (!coupoun) {
    return res.status(404).json(ResponseSchema(req.t('Coupoun doesn\'t exist'), false));
  }
  try {
    let updatedData = {
      code:code,
      discount:discount,
      status:status,
    }
    await UpdateCoupoun(id,updatedData)
  
    return res.status(201).json(ResponseSchema(req.t('Coupoun Updated Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)))
  }
};

exports.getAllCoupouns = async(req, res) => {
  try {
    let coupouns = await GetAllCoupouns()
    const sendedObject = coupouns.map((coupoun) => ({
      id: coupoun._id,
      code:coupoun?.code,
      status:coupoun?.status,
      discount:coupoun?.discount
    }));
    return res.status(200).json(ResponseSchema(req.t('coupouns'), true, sendedObject));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.getAllCoupounssWithPagination = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetCoupounsCount();
  const pages = Math.ceil(count / itemPerPage);
  try {
    let coupouns= await GetAllCoupounsPaginated(page , itemPerPage)
    const sendedObject = coupouns.map((coupoun) => ({
      id: coupoun._id,
      code:coupoun?.code,
      status:coupoun?.status,
      discount:coupoun?.discount
    }));
    return res.status(200).json(ResponseSchema(req.t('Coupouns'), true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.deleteCoupoun = async (req, res) => {
  const { id } =req.params
  if (!CheckValidIdObject(req, res, id, req.t('Coupoun Id is Invalid'))) return;

  const coupoun = await GetCoupounById(id);

  if (!coupoun) {
    return res.status(400).json(ResponseSchema(req.t('coupoun Id is wrong'), false));
  }
  try {
    await DeleteCoupoun(id)
    return res.status(201).json(ResponseSchema(req.t('coupoun Deleted Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};