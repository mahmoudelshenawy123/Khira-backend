const express = require('express')
const cache = require('../../middleware/ResponseCache')
const router = express.Router()
const multer = require('multer')
const {
  getAllCategories,
  getAllCategoriesWithPagination,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./CategoriesController')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    const savedFileName = `${
      file.fieldname
    }-categories-${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`

    cb(null, savedFileName)
  },
})
const upload = multer({
  storage,
}).single('image')

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' })
    next()
  })
}
router.get('/all-categories', cache(3000000), getAllCategories)

router.get(
  '/all-categories-with-pagination',
  cache(3000000),
  getAllCategoriesWithPagination
)

router.post(
  '/create-category',
  cache.deleteCache(),
  uploadModififed,
  createCategory
)

router.put(
  '/update-category/:id',
  cache.deleteCache(),
  uploadModififed,
  updateCategory
)

router.delete(
  '/delete-category/:id',
  cache.deleteCache(),
  multer().none(),
  deleteCategory
)

module.exports = router
