const mongoose = require("mongoose");

const sensorDetectionSchema = new mongoose.Schema({
  sensor_id: {
    type: Number,
    ref: "Sensor",
    required: true,
  },
  time_detection: {
    type: Date,
    default: Date.now,
  },
  action: { type: String,
    enum: ['trigger', 'untrigger'],
    required: true },
});

  module.exports = mongoose.model("SensorDetection", sensorDetectionSchema);