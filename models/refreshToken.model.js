const mongoose = require("mongoose");
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config()

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiryDate: Date,
});

RefreshTokenSchema.statics.createToken = async function (user) {
    let expiredAt = new Date();
  
    expiredAt.setSeconds(
      expiredAt.getSeconds() + process.env.JWT_REFRESH_EXPIRATION
    );
  
    let _token = uuidv4();
  
    let _object = new this({
      token: _token,
      user: user._id,
      expiryDate: expiredAt.getTime(),
    });
  
    let refreshToken = await _object.save();
  
    return refreshToken.token;
  };
  
  RefreshTokenSchema.statics.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  }

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
