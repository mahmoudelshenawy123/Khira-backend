const {
  ResponseSchema, MergeImageLink, SplitImageLink, PaginateSchema,
} = require('../../helper/HelperFunctions');
const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const { AddCategory, GetCagtegoryById, UpdateCagtegory, GetAllCagtegories,
  GetCagtegoriesCount, GetAllCagtegoriesPaginated, DeleteCategory } = require('./CategoriesService');
const { DeleteImage } = require('../../helper/DeleteImage');

exports.createCategory = async(req, res) => {
  const { title_en ,title_ar ,title_ur} = req.body;
  const { file } = req;
    try {
    let addedData={
      'translation.en.title': title_en,
      'translation.ar.title': title_ar,
      'translation.ur.title': title_ur,
      image: file?.filename,
    }
    await AddCategory(addedData)
    return res.status(201).json(ResponseSchema(req.t('Category Added Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)))
  }
};

exports.updateCategory = async (req, res) => {
  const { title_en ,title_ar ,title_ur ,image} = req.body;
  const { file ,params:{id}} = req;

  if (!CheckValidIdObject(req, res, id, req.t('Category Id is Invalid'))) return;

  const category = await GetCagtegoryById(id);

  if (!category) {
    return res.status(404).json(ResponseSchema(req.t('Category doesn\'t exist'), false));
  }
  try {
    let updatedData = {
      'translation.en.title': title_en,
      'translation.ar.title': title_ar,
      'translation.ur.title': title_ur,
      image: file ? file?.filename : image && SplitImageLink(req, image) ,
    }
    await UpdateCagtegory(id,updatedData)
    if(file){
      await DeleteImage(category?.image)
    }
    return res.status(201).json(ResponseSchema(req.t('Category Updated Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)))
  }
};

exports.getAllCategories = async(req, res) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  try {
    let categories = await GetAllCagtegories()
    const sendedObject = categories.map((category) => ({
      id: category._id,
      title: category?.translation?.[`${lang}`]?.title,
      image: category?.image ? MergeImageLink(req, category?.image) : '',
    }));
    return res.status(200).json(ResponseSchema(req.t('Categories'), true, sendedObject));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.getAllCategoriesWithPagination = async (req, res) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';

  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetCagtegoriesCount();
  const pages = Math.ceil(count / itemPerPage);
  try {
    let categories= await GetAllCagtegoriesPaginated(page , itemPerPage)
    const sendedObject = categories.map((item) => ({
      title: item?.translation[`${lang}`]?.title,
      id: item?._id,
      title_en: item?.translation?.en?.title,
      title_ar: item?.translation?.ar?.title,
      title_ur: item?.translation?.ur?.title,
      image: item?.image ? MergeImageLink(req, item?.image) : '',
    }));
    return res.status(200).json(ResponseSchema(req.t('Categories'), true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } =req.params
  if (!CheckValidIdObject(req, res, id, req.t('Category Id is Invalid'))) return;

  const category = await GetCagtegoryById(id);

  if (!category) {
    return res.status(400).json(ResponseSchema(req.t('Category Id is wrong'), false));
  }
  try {
    await DeleteCategory(id)
    await DeleteImage(category?.image)
    return res.status(201).json(ResponseSchema(req.t('Category Deleted Successfully'), true))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};