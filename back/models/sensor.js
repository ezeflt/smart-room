const mongoose = require("mongoose");


const sensorSchema = new mongoose.Schema({
  sensor_id: {
    type: Number,
    required: true
  },
  state: {
    type: Number,
  },
});

module.exports = mongoose.model("Sensor", sensorSchema);
