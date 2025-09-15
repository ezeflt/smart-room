const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
  },
});

module.exports = mongoose.model("Room", roomSchema);