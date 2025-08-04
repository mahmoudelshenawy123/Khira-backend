const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  createProvider, loginProvider, updateProvider, getAllProviders, getProvider, verifyProvider, logOutOrDelete, cahengeActiveStatusProvider, addStory, getAllStories, deleteStory, addReviewToProvider, getAllReviews, getAllNearByProviders,
} = require('./ProvidersController');
// const { createUser, updateUser, verifyUser, getAllUsers, getUser, cahengeActiveStatusUser, logOutOrDelete, rateUser, cahengeActiveStatusProvider } = require('../controllers/UsersController');
const { checkUserStatus } = require('../../middleware/CheckUserStatus');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-Provider-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

    cb(null, savedFileName);
  },
});
const upload = multer({
  storage,
}).fields([
  { name: 'personal_photo', maxCount: 1 },
]);

function uploadyModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    next();
  });
}
const uploadStory = multer({
  storage,
}).single('story_image');

function uploadStoryModififed(req, res, next) {
  uploadStory(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' });
    next();
  });
}

router.post('/create-provider', uploadyModififed, createProvider);

router.post('/login', upload, loginProvider);

router.put('/update-provider/:id', upload, updateProvider);

router.get('/all-providers', getAllProviders);

router.get('/all-near-by-providers', getAllNearByProviders);

router.get('/single-provider/:id', getProvider);

router.post('/verify-provider', multer().none(), verifyProvider);

router.put('/change-provider-status/:id', multer().none(), cahengeActiveStatusProvider);

router.post('/logout', multer().none(), logOutOrDelete);

// router.post('/rate-user',multer().none(),rateUser)

router.post('/add-story', uploadStoryModififed, addStory);

router.delete('/delete-story', multer().none(), deleteStory);

router.get('/all-stories', multer().none(), getAllStories);

router.post('/add-review-to-provider', multer().none(), addReviewToProvider);

router.get('/all-reviews/:id', multer().none(), getAllReviews);

module.exports = router;
