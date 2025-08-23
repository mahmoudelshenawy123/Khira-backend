const express = require('express');

const router = express.Router();
const multer = require('multer');
const { deleteSlider, updateSlider, createSlider, getAllSlidersWithPagination, getAllSliders } = require('./SlidersController');

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
router.get('/all-sliders', getAllSliders);

router.get('/all-sliders-with-pagination', getAllSlidersWithPagination);

router.post('/create-slider', uploadModififed, createSlider);

router.put('/update-slider/:id', uploadModififed, updateSlider);

router.delete('/delete-slider/:id', multer().none(), deleteSlider);

module.exports = router;
