const express = require('express')

const router = express.Router()
const multer = require('multer')
const { updateSettings, getSettings } = require('./GeneralSettingsController')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    const savedFileName = `${file.fieldname}-user-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${file.originalname}`

    cb(null, savedFileName)
  },
})
const upload = multer({
  storage,
}).fields([
  { name: 'project_logo', maxCount: 1 },
  { name: 'product_page_image', maxCount: 1 }, // ✅ added
])

function uploadModififed(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'invalid_file' })
    next()
  })
}

router.put('/update-settings', uploadModififed, updateSettings)

router.get('/', getSettings)

module.exports = router
