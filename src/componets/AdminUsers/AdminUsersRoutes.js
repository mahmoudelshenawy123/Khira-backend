const express = require('express')
const router = express.Router()
const multer = require('multer')
const { checkisUserAdmin } = require('../../middleware/authMiddlewares')
const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  login,
  changeUserStatus,
  getStatistics,
} = require('./AdminUsersController')

router.all('*', checkisUserAdmin)

router.get('/all-users', getAllUsers)

router.get('/statistics', getStatistics)

router.post('/create-user', multer().none(), createUser)

router.post('/login', multer().none(), login)

router.delete('/delete-user/:id', multer().none(), deleteUser)

router.delete('/change-user-status/:id', changeUserStatus)

router.put('/update-user/:id', multer().none(), updateUser)

module.exports = router
