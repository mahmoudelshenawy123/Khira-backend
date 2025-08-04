const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const {
  ResponseSchema, MergeImageLink, SplitImageLink, PaginateSchema,
} = require('../../helper/HelperFunctions');
const { Advertisements } = require('./AdvertisementsModel');
const { AddAdvertisement, GetAdvertisementById, UpdateAdvertisement, GetAllAdvertisement, GetAllAdvertisementPaginated, DeleteAdvertisement } = require('./AdvertisementsService');

exports.createAdvertisement = async(req, res, next) => {
  const { title_en ,type ,link ,description_en,title_ar,description_ar,title_ur,description_ur} = req.body;
  const { file } = req;

  if (type == 2 && !link) {
    return res.status(400).json(ResponseSchema(req.t('Advertisement Order Link is required For Type Link'), false));
  }
  let addedData = {
    background_image: file?.filename,
    link: link,
    'translation.en.title': title_en,
    'translation.en.description': description_en,
    'translation.ar.title': title_ar,
    'translation.ar.description': description_ar,
    'translation.ur.title': title_ur,
    'translation.ur.description': description_ur,
    type: type,
  }
  try{
    let addedAdvertisement = await AddAdvertisement(addedData)
    return res.status(201).json(ResponseSchema(req.t('Advertisement Added Successfully'), true, addedAdvertisement))
  }catch(err){
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.updateAdvertisement = async (req, res) => {
  const { id } =req.params
  const { title_en ,type ,link ,description_en,title_ar,description_ar,title_ur,description_ur ,background_image} = req.body;

  if (!CheckValidIdObject(req, res, id, req.t('Advertisement Id is Invalid'))) return;

  const advertisement = await GetAdvertisementById(id);

  if (!advertisement) {
    return res.status(404).json(ResponseSchema(req.t('Advertisement Doesn\'t Exist'), false));
  }
  if (type == 2 && !link) {
    return res.status(400).json(ResponseSchema(req.t('Advertisement Order Link is required For Type Link'), false));
  }
  const { file } = req;
  let updatedData = {
    background_image: file ? file?.filename : background_image ? SplitImageLink(req, background_image) : '',
    link: link,
    'translation.en.title': title_en,
    'translation.en.description': description_en,
    'translation.ar.title': title_ar,
    'translation.ar.description': description_ar,
    'translation.ur.title': title_ur,
    'translation.ur.description': description_ur,
    type: type,
  }
  try{
    await UpdateAdvertisement(id,updatedData)
    return res.status(201).json(ResponseSchema(req.t('Advertisement Updated Successfully'), true))
  }catch(err){
    console.log(err)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.getAllAdvertisements = async(req, res) => {
  const lang = req.headers['accept-language'] || 'en';
  try {
  let advertisements = await GetAllAdvertisement()
  let sendedObject = advertisements.map((item) => ({
    id: item._id,
    title: item?.translation?.[`${lang}`]?.title ,
    description: item?.translation?.[`${lang}`]?.description,
    link: item?.link ,
    background_image: item?.background_image ? MergeImageLink(req, item?.background_image) : '',
    type: item?.type ,
  }));
    return res.status(200).json(ResponseSchema(req.t('Advertisements'), true, sendedObject));
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.getAdvertisement = async (req, res) => {
  const {id} = req.params
  if (!CheckValidIdObject(req, res, req.params.id, req.t('Advertisement Id is Invalid'))) return;

  const advertisement = await Advertisements.findById(req.params.id);

  if (!advertisement) {
    return res.status(400).json(ResponseSchema(req.t('Advertisement Id is wrong'), false));
  }
  try {
    let advertisement = await GetAdvertisementById(id)
    let sendedObject = {
      id: advertisement._id,
      title_en: advertisement?.translation?.en?.title,
      title_ar: advertisement?.translation?.ar?.title,
      title_ur: advertisement?.translation?.ur?.title,
      description_en: advertisement?.translation?.en?.description,
      description_ar: advertisement?.translation?.ar?.description,
      description_ur: advertisement?.translation?.ur?.description,
      background_image: advertisement?.background_image? MergeImageLink(req, advertisement?.background_image):'',
      link: advertisement?.link,
      type: advertisement?.type,
    };
    return res.status(200).json(ResponseSchema(req.t('Advertisement'), true, sendedObject));
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.getAllAdvertisementsWithPagination = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await Advertisements.find().count();
  const pages = Math.ceil(count / itemPerPage);
  try {
    let advertisements  =await GetAllAdvertisementPaginated({page,itemPerPage})
    const sendedObject = advertisements.map((item) => ({
      id: item?._id,
      title_en: item?.translation?.en?.title,
      title_ar: item?.translation?.ar?.title,
      title_ur: item?.translation?.ur?.title,
      description_en: item?.translation?.en?.description,
      description_ar: item?.translation?.ar?.description,
      description_ur: item?.translation?.ur?.description,
      background_image: item?.background_image?MergeImageLink(req, item?.background_image):'',
      link: item?.link,
      type: item?.type,
    }));
      return res.status(200).json(ResponseSchema(req.t('Advertisements'), true, PaginateSchema(page + 1, pages, count, sendedObject)));
    } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};

exports.deleteAdvertisment = async (req, res) => {
  const { id } =req.params
  if (!CheckValidIdObject(req, res, req.params.id, req.t('Advertisement Id is Invalid'))) return;

  const advertisement = await GetAdvertisementById(id);

  if (!advertisement) {
    return res.status(400).json(ResponseSchema(req.t('Advertisement Id is wrong'), false));
  }
  try {
    await DeleteAdvertisement(id)
    return res.status(201).json(ResponseSchema(req.t('Advertisement Deleted Successfully'), true))
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(err)))
  }
};