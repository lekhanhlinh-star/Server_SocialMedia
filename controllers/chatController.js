const User = require('./../models/UserSchema');
const Chat = require('./../models/ChatSchema');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

exports.getAllChat = catchAsync(async (req, res, next) => {
  Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate('users')
    .populate('groupAdmin')
    .populate('latestMessage')
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: 'latestMessage.sender',
        select: 'name profilePic email'
      });
      res.status(200).json({
        status: 'success',
        data: { results }
      });
    });
});

exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new appError('Do not have member to create chat', 400));
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  })
    .populate('users')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name profilePic email'
  });

  if (isChat.length > 0) {
    res.status(200).json({
      status: 'success',
      data: { chat: isChat[0] }
    });
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId]
    };
    const createdChat = await Chat.create(chatData);
    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      'users'
    );
    res.status(200).json({
      status: 'success',
      data: { FullChat }
    });
  }
});

exports.createGroupChat = catchAsync(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return next(new appError('Please Fill all the feilds', 400));
  }
  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return next(
      new appError('More than 2 users are required to form a group chat', 400)
    );
  }
  users.push(req.user);
  const groupChat = await Chat.create({
    chatName: req.body.name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate('users')
    .populate('groupAdmin');

  res.status(200).json({
    status: 'success',
    data: { fullGroupChat }
  });
});

exports.renameGroup = catchAsync(async (req, res, next) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName
    },
    {
      new: true
    }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!updatedChat) {
    return next(new appError('Chat Not Found', 404));
  } else {
    res.status(200).json({
      status: 'success',
      data: { updatedChat }
    });
  }
});

exports.removeFromGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId }
    },
    {
      new: true
    }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!removed) {
    return next(new appError('Chat Not Found', 404));
  } else {
    res.status(204).json({
      status: 'success',
      data: removed
    });
  }
});

exports.addToGroup = catchAsync(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId }
    },
    {
      new: true
    }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!added) {
    return next(new appError('Chat Not Found', 404));
  } else {
    res.status(204).json({
      status: 'success',
      data: added
    });
  }
});
