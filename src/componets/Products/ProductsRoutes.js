const express = require('express')
const cache = require('../../middleware/ResponseCache')

const router = express.Router()
const multer = require('multer')
const {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getProduct,
  getAllProductsWithPagination,
  getFilteredProductsWithPagination,
} = require('./ProductsController')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-Product-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${file.originalname}`

    cb(null, savedFileName)
  },
})
const upload = multer({
  storage,
}).fields([
  { name: 'images[]', maxCount: 20 },
  { name: 'image', maxCount: 1 },
])

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    console.log(err)
    if (err) return res.status(400).json({ error: 'invalids_file' })
    next()
  })
}

router.get('/single-product/:slug', cache(3000000), getProduct)

router.get('/all-products', cache(3000000), getAllProducts)

router.get(
  '/all-products-with-pagination',
  cache(3000000),
  getAllProductsWithPagination
)

router.post(
  '/create-product',
  cache.deleteCache(),
  uploadModififed,
  createProduct
)

router.put(
  '/update-product/:id',
  cache.deleteCache(),
  uploadModififed,
  updateProduct
)

router.delete(
  '/delete-product/:id',
  cache.deleteCache(),
  multer().none(),
  deleteProduct
)

router.get(
  '/filter-products-with-pagination',
  cache(3000000),
  getFilteredProductsWithPagination
)

module.exports = router
