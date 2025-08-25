const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    maxlength: 255,
  },
  role: {
    type: String,
    enum: ["admin", "client"],
    required: true,
  },
  rooms: {
    type: Array,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
