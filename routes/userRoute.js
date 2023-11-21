const express = require('express');
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');
const imageMiddleware = require('./../controllers/imageMiddleware.js');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgotPass').post(authController.forgotPass);
router.route('/resetPassword/:token').patch(authController.resetPass);

router.use(authController.protect);

router.route('/me').get(userController.getMe, userController.getUser);
router.route('/updateMe').patch(userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);
router.route('/updatePassword').patch(authController.updatePassword);
router.route('/:id/follow').put(userController.follow);
router.route('/:id/following').get(userController.getFollowing);
router.route('/:id/followers').get(userController.getFollowers);
router
  .route('/profilePicture')
  .patch(imageMiddleware.single('profilePic'), userController.profilePic);
router
  .route('/coverPicture')
  .patch(imageMiddleware.single('coverPhoto'), userController.coverPic);

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
