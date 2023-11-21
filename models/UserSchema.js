const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      rrequired: [true, 'Please tell us your first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please tell us your last name'],
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    email: {
      type: String,
      required: [true, 'Please provide your emal'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minleght: 8,
      select: false
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    phone: {
      type: String
    },
    birthday: {
      type: Date
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Passwords are not the same'
      }
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    DateChangePass: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    profilePic: {
      filename: {
        type: String,
        default: '/1700042973733.png'
      }
    },
    coverPhoto: {
      filename: {
        type: String,
        default: '/1700042973733.png'
      }
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Kiểm tra xem mật khẩu có thay đổi không nếu không thì không cần mã hóa
  if (!this.isModified('password')) return next();

  // Có thay đổi thì mã hóa bằng bcrypt with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // Nếu không có thay đổi mật khẩu trong đối tượng hoặc đối tượng này là đối tượng mới thì next()
  if (!this.isModified('password') || this.isNew) return next();
  // Nếu không thỏa điều trên có nghĩa là đối tượng vừa thay đổi password nên ta sẽ update thời gian đổi password
  this.DateChangePass = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ actice: { $ne: false } });
  next();
});

userSchema.methods.checkPass = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkChangePassword = function (JWTTimeStampo) {
  if (this.DateChangePass) {
    const changedTimeStamp = parseInt(this.DateChangePass.getTime() / 1000);
    return JWTTimeStampo < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPassResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

var User = mongoose.model('User', userSchema);
module.exports = User;
