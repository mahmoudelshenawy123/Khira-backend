const { default: mongoose } = require('mongoose')
const {
  ResponseSchema,
  MergeImageLink,
  SplitImageLink,
  PaginateSchema,
} = require('../../helper/HelperFunctions')
const {
  ErrorHandler,
  CheckValidIdObject,
} = require('../../helper/ErrorHandler')
const {
  AddSlider,
  GetSliderById,
  UpdateSlider,
  DeleteSlider,
  GetAllSlidersPaginated,
  GetSlidersCount,
  GetAllSliders,
} = require('./SlidersService')
const { DeleteImage } = require('../../helper/DeleteImage')

exports.createSlider = async (req, res) => {
  const {
    title_en,
    title_ar,
    description_en,
    description_ar,
    // service_id,
    order_number,
  } = req.body
  const { file } = req
  try {
    // if (
    //   !CheckValidIdObject(req, res, service_id, req.t('Service Id is Invalid'))
    // )
    //   return
    const addedData = {
      'translation.en.title': title_en,
      'translation.ar.title': title_ar,
      'translation.en.description': description_en,
      'translation.ar.description': description_ar,
      // service_id,
      order_number,
      image: file?.filename,
    }
    await AddSlider(addedData)
    return res
      .status(201)
      .json(ResponseSchema(req.t('Slider Added Successfully'), true))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          true,
          ErrorHandler(error)
        )
      )
  }
}

exports.updateSlider = async (req, res) => {
  const {
    title_en,
    title_ar,
    description_en,
    description_ar,
    image,
    // service_id,
    order_number,
  } = req.body
  const {
    file,
    params: { id },
  } = req

  if (!CheckValidIdObject(req, res, id, req.t('Slider Id is Invalid'))) return
  const slider = await GetSliderById(id)
  if (!slider) {
    return res
      .status(404)
      .json(ResponseSchema(req.t("Slider doesn't exist"), false))
  }
  try {
    let updatedData = {
      'translation.en.title': title_en,
      'translation.ar.title': title_ar,
      'translation.en.description': description_en,
      'translation.ar.description': description_ar,
      // service_id,
      order_number,
      image: file ? file?.filename : image && SplitImageLink(req, image),
    }
    await UpdateSlider(id, updatedData)
    if (file) {
      await DeleteImage(slider?.image)
    }
    return res
      .status(201)
      .json(ResponseSchema(req.t('Slider Updated Successfully'), true))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          true,
          ErrorHandler(error)
        )
      )
  }
}

exports.getAllSliders = async (req, res) => {
  const lang = req.headers['accept-language'] || 'en'
  try {
    let sliders = await GetAllSliders()
    const sendedObject = sliders.map((category) => ({
      id: category._id,
      title: category?.translation?.[`${lang}`]?.title,
      description: category?.translation?.[`${lang}`]?.description,
      // service_id: category?.service_id,
      order_number: category?.order_number,
      image: category?.image ? MergeImageLink(req, category?.image) : '',
    }))
    return res
      .status(200)
      .json(ResponseSchema(req.t('Sliders'), true, sendedObject))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.getAllSlidersWithPagination = async (req, res) => {
  const lang = req.headers['accept-language'] || 'en'

  const page = req.query.page - 1 || 0
  const itemPerPage = req.query.limit || 10
  const count = await GetSlidersCount()
  const pages = Math.ceil(count / itemPerPage)
  try {
    const sliders = await GetAllSlidersPaginated(page, itemPerPage)
    const sendedObject = sliders.map((item) => ({
      title: item?.translation[`${lang}`]?.title,
      description: item?.translation[`${lang}`]?.description,
      id: item?._id,
      title_en: item?.translation?.en?.title,
      title_ar: item?.translation?.ar?.title,
      description_en: item?.translation?.en?.description,
      description_ar: item?.translation?.ar?.description,
      // service_id: item?.service_id,
      order_number: item?.order_number,
      // title_ur: item?.translation?.ur?.title,
      image: item?.image ? MergeImageLink(req, item?.image) : '',
    }))
    return res
      .status(200)
      .json(
        ResponseSchema(
          req.t('Sliders'),
          true,
          PaginateSchema(page + 1, pages, count, sendedObject)
        )
      )
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.deleteSlider = async (req, res) => {
  const { id } = req.params
  if (!CheckValidIdObject(req, res, id, req.t('Slider Id is Invalid'))) return
  const slider = await GetSliderById(id)
  if (!slider) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Slider Id is wrong'), false))
  }

  const session = await mongoose.connection.startSession()
  try {
    session.startTransaction()
    // await UpdateServices({category_id:id},{is_parent_deleted:true},session)
    await DeleteSlider(id, session)
    await DeleteImage(slider?.image)
    await session.commitTransaction()

    return res
      .status(201)
      .json(ResponseSchema(req.t('Slider Deleted Successfully'), true))
  } catch (error) {
    console.log(error)
    await session.abortTransaction()
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  } finally {
    session.endSession()
  }
}
