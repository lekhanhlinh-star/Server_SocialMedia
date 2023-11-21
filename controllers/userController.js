const User = require('./../models/UserSchema');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const fs = require('fs');
// const upload = multer({ dest: 'uploads/' });
const factory = require('./handlerFactory');

const filterData = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError(
        'This route is not for password update, please use /updatePassword',
        400
      )
    );
  }

  // 2. Filtered out unwanted fields name that are not allow to be updated
  const dataUpdate = filterData(req.body, 'firstname', 'lastname', 'email');

  // 3. Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, dataUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false
  });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.follow = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (user == null) {
    return next(new appError('Do not exist user to follow', 404));
  }

  const isFollowing = user.followers && user.followers.includes(req.user._id);
  const option = isFollowing ? '$pull' : '$addToSet';

  const userUpdate = await User.findByIdAndUpdate(
    req.user._id,
    { [option]: { following: userId } },
    { new: true }
  );

  User.findByIdAndUpdate(userId, {
    [option]: { followers: req.user._id }
  });

  res.status(200).json({
    status: 'success',
    data: {
      userUpdate
    }
  });
});

exports.getFollowing = catchAsync(async (req, res, next) => {
  const following = await User.findById(req.params.id).populate('following');
  res.status(200).json({
    status: 'success',
    data: {
      following
    }
  });
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const followers = await User.findById(req.params.id).populate('followers');
  res.status(200).json({
    status: 'success',
    data: {
      followers
    }
  });
});

exports.profilePic = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new appError('No file uploaded with request.', 400));
  }

  const media = { filename: req.file.filename };
  const updateProfilePic = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: media },
    { new: true }
  );
  res.status(204).json({
    status: 'success',
    data: {
      updateProfilePic
    }
  });
});

exports.coverPic = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new appError('No file uploaded with request.', 400));
  }

  const media = { filename: req.file.filename };
  const updateCoverPhoto = await User.findByIdAndUpdate(
    req.user._id,
    { coverPhoto: media },
    { new: true }
  );
  res.status(204).json({
    status: 'success',
    data: {
      updateCoverPhoto
    }
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
