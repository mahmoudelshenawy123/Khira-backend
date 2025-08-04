const express =require('express')
const router = express.Router();
const multer = require('multer');
const { deleteContactUs, createContactUs, updateContactUs, getAllContactUs, getAllContactUsWithoutPagination } = require('./ContactUsRequestsController');

router.post('/create-contact-us',multer().none(),createContactUs)

router.delete('/delete-contact-us/:id',deleteContactUs)

router.put('/update-contact-us/:id',multer().none(),updateContactUs)

router.get('/',getAllContactUs) 

router.get('/all-contact-us',getAllContactUsWithoutPagination) 


module.exports = router