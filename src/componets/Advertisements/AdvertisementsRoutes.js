const express = require('express');

const router = express.Router();
const multer = require('multer');
const { checkisUserAdmin, checkisUserActive } = require('../../middleware/authMiddlewares');
const {
  createAdvertisement, getAllAdvertisements, updateAdvertisement, deleteAdvertisment, getAllAdvertisementsWithPagination, getAdvertisement,
} = require('./AdvertisementsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-advertisement-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

    cb(null, savedFileName);
  },
});
const upload = multer({
  storage,
}).single('background_image');

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    next();
  });
}

router.get('/all-advertisments', getAllAdvertisements);

router.get('/all-advertisments-with-pagination', getAllAdvertisementsWithPagination);

router.get('/:id', getAdvertisement);

router.all('*',checkisUserAdmin ,checkisUserActive)

router.post('/create-advertisment', uploadModififed, createAdvertisement);

router.put('/update-advertisment/:id', uploadModififed, updateAdvertisement);

router.delete('/delete-advertisment/:id', multer().none(), deleteAdvertisment);

module.exports = router;
