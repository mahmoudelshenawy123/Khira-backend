const express = require('express');

const router = express.Router();
const multer = require('multer');
const {
  createCity, updateCity, getAllCities, deleteCity, getAllCitiesWithPagination,
} = require('./CitiesController');

router.get('/all-cities', getAllCities);

router.get('/all-cities-with-pagination', getAllCitiesWithPagination);

router.post('/create-city', multer().none(), createCity);

router.put('/update-city/:id', multer().none(), updateCity);

router.delete('/delete-city/:id', multer().none(), deleteCity);

module.exports = router;
