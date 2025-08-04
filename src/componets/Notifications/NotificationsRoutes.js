const express = require('express');
const router = express.Router();
const { getAllNotifications } = require('./NotificationsController');

router.get('/all-notifications', getAllNotifications);

module.exports = router;