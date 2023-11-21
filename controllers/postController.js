const Post = require('./../models/PostSchema');
const APIFeature = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setUser = (req, res, next) => {
    if (!req.body.postedBy) {
        req.body.postedBy = req.user._id;
    }
    next();
};

exports.setImage = (req, res, next) => {
    console.log(req.body)
    console.log(req)
    if (req.files) {
        const media = req.files.map((file) => ({filename: file.filename}));
        req.body.image = media;
    }
    next();
};

exports.getAllPosts = factory.getAll(Post);
exports.getPost = factory.getOne(Post);
exports.createPost = factory.createOne(Post);
exports.updatePost = factory.updateOne(Post);
exports.deletePost = factory.deleteOne(Post);

exports.like = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;
    const isLiked = req.user.likes && req.user.likes.includes(postId);

    const option = isLiked ? '$pull' : '$addToSet';

    // Insert user like
    await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true});

    // Insert post like
    const post = await Post.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new: true});

    res.status(200).json({
        status: 'success', data: {post}
    });
});

exports.retweet = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;

    // Try and delete retweet
    const deletedPost = await Post.findOneAndDelete({
        postedBy: userId, retweetData: postId
    });

    const option = deletedPost != null ? '$pull' : '$addToSet';

    let repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({postedBy: userId, retweetData: postId});
    }

    await User.findByIdAndUpdate(userId, {[option]: {retweets: repost._id}}, {new: true});

    const post = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new: true});

    res.status(200).json({
        status: 'success', data: {post}
    });
});
