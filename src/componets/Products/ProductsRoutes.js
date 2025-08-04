const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  createProduct, 
  updateProduct, 
  getAllProducts,
  deleteProduct, 
  getProduct,
  getAllProductsWithPagination,
  getFilteredProductsWithPagination,
} = require('./ProductsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-Product-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

    cb(null, savedFileName);
  },
});
const upload = multer({
  storage,
}).fields([
  { name: 'images[]', maxCount: 20 },
  { name: 'image', maxCount: 1 },
]);

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    console.log(err);
    if (err) return res.status(400).json({ error: 'invalids_file' });
    next();
  });
}

router.get('/single-product/:slug', getProduct);

router.get('/all-products', getAllProducts);

router.get('/all-products-with-pagination', getAllProductsWithPagination);

router.post('/create-product', uploadModififed, createProduct);

router.put('/update-product/:id', uploadModififed, updateProduct);

router.delete('/delete-product/:id', multer().none(), deleteProduct);


router.get('/filter-products-with-pagination', getFilteredProductsWithPagination);

module.exports = router;