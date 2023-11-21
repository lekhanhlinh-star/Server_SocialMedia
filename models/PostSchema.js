const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    image: [
      {
        filename: {
          type: String,
          require: true
        }
      }
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Post' },
    retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetData: { type: Schema.Types.ObjectId, ref: 'Post' }
  },
  { timestamps: true }
);

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
