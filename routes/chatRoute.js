const express = require('express');
const authController = require('../controllers/authController.js');
const chatController = require('./../controllers/chatController.js');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').post(chatController.accessChat);
router.route('/').get(chatController.getAllChat);
router.route('/group').post(chatController.createGroupChat);
router.route('/rename').put(chatController.renameGroup);
router.route('/groupremove').put(chatController.removeFromGroup);
router.route('/groupadd').put(chatController.addToGroup);

module.exports = router;
