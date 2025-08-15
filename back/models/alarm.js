const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['active', 'desactive'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  }
});

module.exports = mongoose.model("Alarm", alarmSchema);

