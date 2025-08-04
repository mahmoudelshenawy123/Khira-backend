const { Products } = require('./ProductsModel')
const { ProductReviews } = require('./ReviewsModel')

exports.AddProduct = async (data) => {
  try {
    let product = await Products.create(data)
    return product
  } catch (err) {
    throw err
  }
}

exports.UpdateProduct = async (id, data) => {
  try {
    let product = await Products.findByIdAndUpdate(id, data, { new: true })
    return product
  } catch (err) {
    throw err
  }
}

exports.UpdateProductSession = async (id, data, session) => {
  try {
    let product = await Products.findByIdAndUpdate(id, data, { session })
    return product
  } catch (err) {
    throw err
  }
}

exports.GetProductById = async (id) => {
  try {
    let product = await Products.findById(id)
    return product
  } catch (err) {
    throw err
  }
}

exports.GetProductBySlug = async (slug) => {
  try {
    let product = await Products.findOne({ slug: slug }).populate('category_id')
    return product
  } catch (err) {
    throw err
  }
}

exports.GetProductByIdPopulated = async (id) => {
  try {
    let product = await Products.findById(id).populate([
      'provider_id',
      'reviews.user_id',
      'category_id',
    ])
    return product
  } catch (err) {
    throw err
  }
}

exports.GetProductsCount = async () => {
  try {
    let products = await Products.find().count()
    return products
  } catch (err) {
    throw err
  }
}

exports.GetProductsCountByQuery = async (query) => {
  try {
    let products = await Products.find(query).count()
    return products
  } catch (err) {
    throw err
  }
}

exports.GetProductByQuery = async (query) => {
  try {
    let products = await Products.findOne(query)
    return products
  } catch (err) {
    throw err
  }
}

exports.GetNextProductByQuery = async (id) => {
  try {
    let products = await Products.find({ _id: { $gt: id } })
      .sort({ _id: 1 })
      .limit(1)
    return products
  } catch (err) {
    throw err
  }
}

exports.GetPreviousProductByQuery = async (id) => {
  try {
    let products = await Products.find({ _id: { $gt: id } })
      .sort({ _id: -1 })
      .limit(1)
    return products
  } catch (err) {
    throw err
  }
}

exports.GetAllProducts = async () => {
  try {
    let products = await Products.find({}).sort({ created_at: -1 })
    return products
  } catch (err) {
    throw err
  }
}

exports.GetAllProviderProducts = async (query) => {
  try {
    let products = await Products.find(query).populate([
      'provider_id',
      'reviews.user_id',
      'category_id',
    ])
    return products
  } catch (err) {
    throw err
  }
}

exports.GetAllProviderProductsPaginated = async (query, page, itemPerPage) => {
  try {
    let products = await Products.find(query)
      .populate(['provider_id', 'reviews.user_id', 'category_id'])
      .sort({ created_at: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage)
    return products
  } catch (err) {
    throw err
  }
}

exports.GetAllProductsPaginated = async (page, itemPerPage) => {
  try {
    let products = await Products.find({})
      .populate('category_id')
      .sort({ created_at: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage)
    return products
  } catch (err) {
    throw err
  }
}

exports.GetTopRatedProductsPaginated = async (page, itemPerPage) => {
  try {
    let products = await Products.find({})
      .populate(['provider_id', 'reviews.user_id', 'category_id'])
      .sort({ total_rate: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage)
    return products
  } catch (err) {
    throw err
  }
}

exports.GetFilterProducts = async (query, sortQuery) => {
  try {
    let products = await Products.find(query)
      .populate(['provider_id', 'reviews.user_id', 'category_id'])
      .sort(sortQuery)
    return products
  } catch (err) {
    throw err
  }
}

exports.DeleteProduct = async (id) => {
  try {
    let products = await Products.findByIdAndDelete(id)
    return products
  } catch (err) {
    throw err
  }
}

exports.AddReview = async (data, session) => {
  try {
    let addedReview = await ProductReviews.create(data, { session })
    return addedReview
  } catch (error) {
    throw error
  }
}

exports.GetReviewsCount = async () => {
  try {
    let reviewsCount = await ProductReviews.find().count()
    return reviewsCount
  } catch (error) {
    throw error
  }
}

exports.GetAllReviews = async (id, page, itemPerPage) => {
  try {
    let reviews = await ProductReviews.find({ product_id: id })
      .populate('user_id')
      .sort({ _id: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage)
    return reviews
  } catch (error) {
    throw error
  }
}
