const express = require('express');
const router = express.Router();
const notificationController = require('../components/notification');

router.post('/register-token', notificationController.registerDeviceToken);

module.exports = router;