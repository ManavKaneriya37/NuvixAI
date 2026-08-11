const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
  },
});

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({email: this.email, id: this._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
    return token;
}

userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

const User = mongoose.model("User", userSchema);

module.exports = User;