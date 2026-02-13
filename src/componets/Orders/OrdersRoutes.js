const express = require('express')

const router = express.Router()
const multer = require('multer')
const {
  createOrder,
  getAllProvidersOrdersWithStatus,
  askForSpecialRequestOrder,
  sendMessageInSpecialRequest,
  getSpecialRequestMessages,
  sendOfferToSpecialRequest,
  acceptSpecialRequestOffer,
  getAllOrdersWithStatus,
  getOrder,
  getAllSpecialRequests,
  getAllUsersOrders,
  getAllOrders,
  changeOrderStatus,
  payOrder,
  deleteOrder,
} = require('./OrdersController')
const cache = require('../../middleware/ResponseCache')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    const savedFileName = `${
      file.fieldname
    }-Provider-${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`

    cb(null, savedFileName)
  },
})
const upload = multer({
  storage,
}).fields([{ name: 'special_request_audio_file', maxCount: 1 }])

function uploadyModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' })
    next()
  })
}
const uploadMessageFile = multer({
  storage,
}).fields([{ name: 'uploaded_message_file', maxCount: 1 }])

function uploadMessageFileModififed(req, res, next) {
  uploadMessageFile(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' })
    next()
  })
}

router.post('/create-order', cache.deleteCache(), multer().none(), createOrder)

router.get('/all-orders-with-status', getAllOrdersWithStatus)

router.get('/all-users-orders', getAllUsersOrders)

router.get('/all-orders', getAllOrders)

router.get('/single-order/:id', getOrder)

router.post('/update-order-status', multer().none(), changeOrderStatus)

router.post('/pay-order/:id', multer().none(), payOrder)

router.post(
  '/ask-for-special-request',
  uploadyModififed,
  askForSpecialRequestOrder
)

router.post(
  '/send-message',
  uploadMessageFileModififed,
  sendMessageInSpecialRequest
)

router.post(
  '/send-offer-to-special-request',
  multer().none(),
  sendOfferToSpecialRequest
)

router.post(
  '/accept-special-request-offer',
  multer().none(),
  acceptSpecialRequestOffer
)

router.get('/special-request/:id', getSpecialRequestMessages)

router.get('/all-special-requests', getAllSpecialRequests)

router.delete('/delete-order/:id', multer().none(), deleteOrder)

module.exports = router
