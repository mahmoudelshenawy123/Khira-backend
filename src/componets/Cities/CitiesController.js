const {
  ResponseSchema, MergeImageLink, SplitImageLink, PaginateSchema,
} = require('../../helper/HelperFunctions');
const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const { City } = require('./CititesModel');
const { Square } = require('../Neighborhoods/NeighborhoodsModel');
const { AddCity, GetCityById, UpdateCity, GetAllCities, GetAllCitiesPaginated, GetCitiesCount, DeleteCity } = require('./CitiesService');
const { GetNeighborhoodsCountByCityId } = require('../Neighborhoods/NeighborhoodsService');

exports.createCity = async(req, res) => {
  const {name_en ,name_ar ,name_ur} = req.body;
  try {
    let addedData ={
      'translation.en.name': name_en,
      'translation.ar.name': name_ar,
      'translation.ur.name': name_ur,
    }
    await AddCity(addedData)
    return res.status(201).json(ResponseSchema(req.t('City Added Successfully'), true))
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)))
  }
};

exports.updateCity = async (req, res) => {
  const {body:{name_en ,name_ar ,name_ur} ,params:{id}} = req;

  if (!CheckValidIdObject(req, res, id, req.t('City Id is Invalid'))) return;

  const city = await GetCityById(id);

  if (!city) {
    return res.status(400).json(ResponseSchema(req.t('City Id is wrong'), false));
  }
  try {
    let updatedData ={
      'translation.en.name': name_en,
      'translation.ar.name': name_ar,
      'translation.ur.name': name_ur,
    }
    await UpdateCity(id,updatedData)
    return res.status(201).json(ResponseSchema(req.t('City Updated Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)))
  }
};

exports.getAllCities = async(req, res) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  try {
    let cities = await GetAllCities()
    const sendedObject = cities.map((city) => ({
      id: city._id,
      name: city?.translation?.[`${lang}`]?.name,
    }));
    return res.status(200).json(ResponseSchema(req.t('Cities'), true, sendedObject));

  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.getAllCitiesWithPagination = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetCitiesCount();
  const pages = Math.ceil(count / itemPerPage);
  try {
    let cities = await GetAllCitiesPaginated(page , itemPerPage)
    const sendedObject = cities.map((city) => ({
      id: city._id,
      name_en: city?.translation?.en?.name,
      name_ar: city?.translation?.ar?.name,
      name_ur: city?.translation?.ur?.name,
    }));
    return res.status(200).json(ResponseSchema(req.t('Cities'), true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.deleteCity = async (req, res) => {
  const {id} = req.params
  if (!CheckValidIdObject(req, res, id, req.t('City Id is Invalid'))) return;

  const city = await GetCityById(id);

  if (!city) {
    return res.status(400).json(ResponseSchema(req.t('City Id is wrong'), false));
  }
  const count = await GetNeighborhoodsCountByCityId(id)

  if (count > 0) {
    return res.status(400).json(ResponseSchema(req.t("Can't delete this city because it has neighborhood in it"), false));
  }
  try {
    await DeleteCity(id) 
    return res.status(201).json(ResponseSchema(req.t('City Deleted Successfully'), true))
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};
