const mongoose = require("mongoose");

const sensorStatSchema = new mongoose.Schema({
  sensor_id: {
    type: Number,
    required: true,
  },
  get_time: {
    type: Date,
    default: Date.now,
  },
  temperature: {
    type: Number,
  },
  pressure: {
    type: Number,
  },
  humidity: {
    type: Number,
  },
});

module.exports = mongoose.model("SensorStat", sensorStatSchema);