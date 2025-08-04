const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  createUser, updateUser, verifyUser, getAllUsers, getUser, cahengeActiveStatusUser, logOutOrDelete, addRemoverProductsInFavorite, getAllUserFavoritedProducts, updateUserBillingAddress, updateUserShippingAddress, updateUserPersonalImage, loginUser, forgetPassword, resetPassword, deleteUser,
} = require('./UsersController');
const { checkUserStatus } = require('../../middleware/CheckUserStatus');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-user-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

    cb(null, savedFileName);
  },
});
const upload = multer({
  storage,
}).fields([
  { name: 'personal_photo', maxCount: 1 },
]);

router.post('/create-user', multer().none(), createUser);

router.post('/login', multer().none(), loginUser);

router.put('/update-user', upload, updateUser);

router.post('/forget-password', multer().none(), forgetPassword);

router.post('/reset-password', multer().none(), resetPassword);

router.put('/update-user-billing-address', multer().none(), updateUserBillingAddress);

router.put('/update-user-shipping-address', multer().none(), updateUserShippingAddress);

router.put('/update-user-presonal-photo', upload, updateUserPersonalImage);

router.get('/all-users', getAllUsers);

router.get('/single-user', getUser);

router.post('/verify-user', multer().none(), verifyUser);

router.put('/change-user-status/:id', multer().none(), cahengeActiveStatusUser);

router.post('/logout', multer().none(), logOutOrDelete);

router.delete('/delete-user/:id', multer().none(), deleteUser);

router.post('/add-remove-from-favorite', multer().none(), addRemoverProductsInFavorite);

router.get('/all-favorited-products', getAllUserFavoritedProducts);

module.exports = router;
