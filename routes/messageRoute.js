const express = require('express');
const messageController = require('./../controllers/messageController');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/:chatId').get(messageController.allMessages);
router.route('/').post(messageController.sendMessage);

module.exports = router;
