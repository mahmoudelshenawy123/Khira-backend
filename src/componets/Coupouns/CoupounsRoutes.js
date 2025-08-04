const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  createCoupoun, updateCoupoun, getAllCoupouns, getAllCoupounssWithPagination, deleteCoupoun,
} = require('./CoupounsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-categories-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

    cb(null, savedFileName);
  },
});
const upload = multer({
  storage,
}).single('image');

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    next();
  });
}
router.get('/all-coupouns', getAllCoupouns);

router.get('/all-coupouns-with-pagination', getAllCoupounssWithPagination);

router.post('/create-coupoun', uploadModififed, createCoupoun);

router.put('/update-coupoun/:id', uploadModififed, updateCoupoun);

router.delete('/delete-coupoun/:id', multer().none(), deleteCoupoun);

module.exports = router;
