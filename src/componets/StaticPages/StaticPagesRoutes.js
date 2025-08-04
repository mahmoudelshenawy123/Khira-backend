const express = require('express');
const multer = require('multer');

const router = express.Router();
const { updateStaticPages, getStaticPagesAll, getStaticPages } = require('./StaticPagesController');

router.get('/all', getStaticPagesAll);

router.put('/update-static-pages', multer().none(), updateStaticPages);

router.get('/', getStaticPages);

module.exports = router;
