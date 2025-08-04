const express = require('express');
const router = express.Router();
const AdminUsersRoutes = require('src/componets/AdminUsers/AdminUsersRoutes');

const AdvertisementsRoutes = require('src/componets/Advertisements/AdvertisementsRoutes');
const CartRoutes = require('src/componets/Cart/CartRoutes');
const CategoriesRoutes = require('src/componets/Categories/CategoriesRoutes');

const ProvidersRoutes = require('src/componets/Providers/ProvidersRoutes');
const UserRoutes = require('src/componets/Users/UsersRoutes');
const UsersAddressRoutes = require('src/componets/UsersAddress/UsersAddressRoutes');
const CityRoutes = require('src/componets/Cities/CityRoutes');
const NeighborhoodsRoutes = require('src/componets/Neighborhoods/NeighborhoodsRoutes');
const OrdersRoutes = require('src/componets/Orders/OrdersRoutes');

const GeneralSettingsRoutes = require('src/componets/GeneralSettings/GeneralSettingsRoutes');
const StaticPagesRoutes = require('src/componets/StaticPages/StaticPagesRoutes');
const ProductsRoutes = require('src/componets/Products/ProductsRoutes');

// routes
router.use('/orders', OrdersRoutes);

router.use('/city', CityRoutes);
router.use('/neighborhood', NeighborhoodsRoutes);
router.use('/address', UsersAddressRoutes);
router.use('/admin', AdminUsersRoutes);
router.use('/advertisement', AdvertisementsRoutes);
router.use('/settings', GeneralSettingsRoutes);
router.use('/static-pages', StaticPagesRoutes);
router.use('/user', UserRoutes);
router.use('/provider', ProvidersRoutes);
router.use('/category', CategoriesRoutes);
router.use('/product', ProductsRoutes);
router.use('/cart', CartRoutes);


module.exports = router;
