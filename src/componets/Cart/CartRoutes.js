const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  addProductToCart, getAllCartItems, deleteCartItem, updateCartItemQuantity, getAllCartItemsWithPagination,
} = require('./CartController');

router.get('/all-cart-items/:unique_identifier', multer().none(), getAllCartItems);

router.get('/all-cart-items-with-pagination', multer().none(), getAllCartItemsWithPagination);

router.post('/add-product-to-cart', multer().none(), addProductToCart);

router.put('/update-cart-item-quantity', multer().none(), updateCartItemQuantity);

router.delete('/delete-cart/:id', multer().none(), deleteCartItem);

module.exports = router;
