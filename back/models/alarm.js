const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['active', 'desactive'],
    required: true
  }
});

module.exports = mongoose.model("Alarm", alarmSchema);

