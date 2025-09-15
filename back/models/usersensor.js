const mongoose = require("mongoose");

const userSensorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sensor_id: {
    type: Number,
    required: true,
  },
});

const UserSensor = mongoose.model("UserSensor", userSensorSchema);
module.exports = UserSensor;