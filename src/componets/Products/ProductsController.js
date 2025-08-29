/* eslint-disable semi */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
const NodeGeocoder = require('node-geocoder')
const distance = require('google-distance-matrix')
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
  AddProduct,
  GetProductById,
  UpdateProduct,
  GetAllProducts,
  GetProductsCount,
  GetAllProductsPaginated,
  DeleteProduct,
  GetFilterProducts,
  GetProductByQuery,
  GetProductBySlug,
  GetNextProductByQuery,
  GetPreviousProductByQuery,
} = require('./ProductsService')
const { DeleteImage } = require('../../helper/DeleteImage')
const { getFilterProviders } = require('../Providers/ProvidersController')
const { GetCagtegoryById } = require('../Categories/CategoriesService')

const options = {
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null,
  language: 'en',
}

distance.key(process.env.GOOGLE_API_KEY)
function ProductModal(product, lang, req) {
  const sizes = product?.sizes.map((size) => ({
    id: size?._id,
    title: size?.title?.[`${lang}`],
    title_en: size?.title?.en,
    title_ar: size?.title?.ar,
    price: size?.price,
    price_before_discount: size?.price_before_discount,
    quantity: size?.quantity,
  }))
  const category = {
    id: product?.category_id?._id,
    title: product?.category_id?.translation?.[`${lang}`]?.title,
    title_en: product?.category_id?.translation?.en?.title,
    title_ar: product?.category_id?.translation?.ar?.title,
  }
  return {
    id: product._id,
    title: product?.translation?.[`${lang}`]?.title,
    title_en: product?.translation?.en?.title,
    title_ar: product?.translation?.ar?.title,
    description: product?.translation?.[`${lang}`]?.description,
    description_en: product?.translation?.en?.description,
    description_ar: product?.translation?.ar?.description,
    category_id: product?.category_id?._id,
    sizes,
    category,
    images: product?.images.map((img) => img && MergeImageLink(req, img)),
    image: product?.image ? MergeImageLink(req, product?.image) : '',
    price: product?.price,
    slug: product?.slug,
  }
}
exports.ProductModal = ProductModal

exports.createProduct = async (req, res) => {
  const {
    title_en,
    title_ar,
    description_en,
    description_ar,
    price,
    sizes,
    category_id,
  } = req.body
  const {
    files: { 'images[]': imagesFiles, image },
  } = req
  const product = await GetProductByQuery({ 'translation.en.title': title_en })
  if (product) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Prodct English Title Already Exist'), false))
  }
  const addedSizes = sizes?.map((size) => ({
    title: {
      en: size?.title_en,
      ar: size?.title_ar,
    },
    price: Number(size?.price),
    price_before_discount: Number(size?.price_before_discount),
    quantity: Number(size?.quantity),
  }))

  try {
    const addedData = {
      'translation.en.title': title_en,
      'translation.ar.title': title_ar,
      'translation.en.description': description_en,
      'translation.ar.description': description_ar,
      category_id,
      price,
      slug: title_en.split(' ').join('-'),
      sizes: addedSizes,
      images: imagesFiles?.map((image) => image?.filename),
      image: image?.[0]?.filename,
    }
    const x = await AddProduct(addedData)
    return res
      .status(201)
      .json(ResponseSchema(req.t('Product Added Successfully'), true, x))
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

exports.updateProduct = async (req, res) => {
  const {
    title_en,
    title_ar,
    description_en,
    description_ar,
    category_id,
    price,
    sizes,
    images: images_body,
    image: image_body,
  } = req.body
  const { id } = req.params
  const {
    files: { 'images[]': imagesFiles, image },
  } = req
  const modifiedImages = []

  if (!CheckValidIdObject(req, res, id, req.t('Product Id is Invalid'))) return
  const product = await GetProductById(id)
  if (!product) {
    return res
      .status(404)
      .json(ResponseSchema(req.t("Product doesn't exist"), false))
  }
  const addedSizes = sizes?.map((size) => ({
    title: {
      en: size?.title_en,
      ar: size?.title_ar,
    },
    price: size?.price,
    price_before_discount: size?.price_before_discount,
    quantity: size?.quantity,
  }))
  if (images_body) {
    images_body?.forEach((img) => {
      modifiedImages.push(SplitImageLink(req, img))
    })
    product?.images.forEach(async (image) => {
      if (!images_body?.includes(MergeImageLink(req, image))) {
        await DeleteImage(image)
      }
    })
  }
  if (imagesFiles) {
    imagesFiles.forEach((image) => {
      modifiedImages.push(image.filename)
    })
  }
  if (category_id) {
    if (
      !CheckValidIdObject(
        req,
        res,
        category_id,
        req.t('Category ID is Invalid')
      )
    )
      return
    const category = await GetCagtegoryById(category_id)
    if (!category) {
      return res
        .status(400)
        .json(ResponseSchema(req.t('Category not found'), false))
    }
  }
  try {
    const updatedData = {
      'translation.en.title': title_en,
      'translation.ar.title': title_ar,
      'translation.en.description': description_en,
      'translation.ar.description': description_ar,
      price,
      category_id,
      slug: title_en.split(' ').join('-'),
      sizes: addedSizes,
      images: modifiedImages,
      image: image?.[0]?.filename || SplitImageLink(req, image_body),
    }
    const x = await UpdateProduct(id, updatedData)
    return res
      .status(201)
      .json(ResponseSchema(req.t('Product Updated Successfully'), true, x))
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

exports.getProduct = async (req, res) => {
  const lang = req.headers['accept-language']
    ? req.headers['accept-language']
    : 'en'
  const { slug } = req.params

  const product = await GetProductBySlug(slug)

  if (!product) {
    return res
      .status(404)
      .json(ResponseSchema(req.t("Product doesn't exist"), false))
  }
  const previousProduct = await GetPreviousProductByQuery(product?._id)
  const nextProduct = await GetNextProductByQuery(product?._id)

  try {
    const sendedProduct = ProductModal(product, lang, req)
    const sendedObject = {
      product: sendedProduct,
      next_product:
        nextProduct?.[0] && ProductModal(nextProduct?.[0], lang, req),
      previous_product:
        previousProduct?.[0] && ProductModal(previousProduct?.[0], lang, req),
    }

    return res
      .status(200)
      .json(ResponseSchema(req.t('Product'), true, sendedObject))
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

exports.getAllProducts = async (req, res) => {
  const lang = req.headers['accept-language']
    ? req.headers['accept-language']
    : 'en'
  try {
    const products = await GetAllProducts()
    const sendedObject = products?.map((product) =>
      ProductModal(product, lang, req)
    )

    return res
      .status(200)
      .json(ResponseSchema(req.t('Products'), true, sendedObject))
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

exports.getAllProductsWithPagination = async (req, res) => {
  const lang = req.headers['accept-language']
    ? req.headers['accept-language']
    : 'en'

  const page = req.query.page - 1 || 0
  const itemPerPage = req.query.limit || 10
  const count = await GetProductsCount()
  const pages = Math.ceil(count / itemPerPage)

  try {
    const products = await GetAllProductsPaginated(page, itemPerPage)
    const sendedObject = products?.map((product) =>
      ProductModal(product, lang, req)
    )

    return res
      .status(200)
      .json(
        ResponseSchema(
          req.t('Products'),
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

exports.getFilteredProductsWithPagination = async (req, res) => {
  const lang = req.headers['accept-language']
    ? req.headers['accept-language']
    : 'en'
  const {
    search_type,
    search_text,
    rate,
    location,
    price,
    current_latitude,
    current_longitude,
  } = req?.query
  options.language = `${lang}`
  const geocoderr = NodeGeocoder(options)

  let searchedQuery = {}
  let sortedQuery = { created_at: -1 }

  if (!search_type) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Somethings Went wrong'), false))
  }

  if (search_type == 'product') {
    searchedQuery = { 'translation.en.title': new RegExp(search_text, 'i') }
    if (rate) {
      sortedQuery = { total_rate: rate }
    }
    if (price) {
      sortedQuery = { ...sortedQuery, price_after_dicount: price }
    }
    try {
      const products = await GetFilterProducts(searchedQuery, sortedQuery)
      const sendedObject = await Promise.all(
        products.map(async (product) => {
          const providerAddress = await geocoderr.geocode(
            `${product?.provider_id?.current_latitude},${product?.provider_id?.current_longitude}`
          )
          return await ProductModal(product, providerAddress, lang, req)
        })
      )
      return res
        .status(200)
        .json(ResponseSchema(req.t('Products'), true, sendedObject))
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
  } else if (search_type == 'provider') {
    try {
      searchedQuery = { store_name: new RegExp(search_text, 'i') }
      let sendedObject = await getFilterProviders(req, searchedQuery)
      const modififedSendedObject = []
      if (location) {
        if (current_latitude && current_longitude) {
          await Promise.all(
            sendedObject.map(
              (provider) =>
                new Promise((resolve, reject) => {
                  const clientPlace = [
                    `${current_latitude},${current_longitude}`,
                  ]
                  const providerPlace = [
                    `${provider?.current_latitude},${provider?.current_longitude}`,
                  ]
                  distance.matrix(
                    [clientPlace],
                    [providerPlace],
                    (err, distances) => {
                      if (!err) {
                        if (
                          distances?.rows?.[0]?.elements?.[0]?.distance?.value
                        ) {
                          modififedSendedObject.push({
                            ...provider,
                            distance_value:
                              distances?.rows?.[0]?.elements?.[0]?.distance
                                ?.value,
                            distance_text:
                              distances?.rows?.[0]?.elements?.[0]?.distance
                                ?.text,
                          })
                          resolve()
                        } else {
                          resolve()
                        }
                      } else {
                        reject(err)
                      }
                    }
                  )
                })
            )
          )
        }
        if (location == 1) {
          sendedObject = modififedSendedObject.sort(
            (a, b) => a?.distance_value - b?.distance_value
          )
        } else {
          sendedObject = modififedSendedObject.sort(
            (a, b) => b?.distance_value - a?.distance_value
          )
        }
      }
      return res
        .status(200)
        .json(ResponseSchema(req.t('Stores'), true, sendedObject))
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
}

exports.deleteProduct = async (req, res) => {
  const { id } = req.params
  if (!CheckValidIdObject(req, res, id, req.t('Product Id is Invalid'))) return

  const product = await GetProductById(id)

  if (!product) {
    return res
      .status(404)
      .json(ResponseSchema(req.t("Product doesn't exist"), false))
  }
  try {
    await DeleteProduct(id)
    return res
      .status(201)
      .json(ResponseSchema(req.t('Product Deleted Successfully'), true))
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
  // let count = await Square.find({city_id:id}).count()
  // if(count>0){
  //     return res.status(400).json(ResponseSchema(req.t("Can't delete this city because it has squares in it"),false))
  // }
}
