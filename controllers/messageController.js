const Message = require('../models/MessageSchema');
const User = require('../models/UserSchema');
const Chat = require('../models/ChatSchema');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

exports.allMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name profilePic email')
    .populate('chat');

  if (!messages) {
    return next(new appError('Do not exist Chat', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { messages }
  });
});

exports.sendMessage = catchAsync(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return next(new appError('Invalid data passed into request', 404));
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId
  };

  let message = await Message.create(newMessage);

  message = await message.populate('sender', 'name pic').execPopulate();
  message = await message.populate('chat').execPopulate();
  message = await User.populate(message, {
    path: 'chat.users',
    select: 'name profilePic email'
  });

  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

  res.status(200).json({
    status: 'success',
    data: { message }
  });
});
