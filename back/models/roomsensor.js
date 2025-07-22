const mongoose = require("mongoose");


const roomSensorSchema = new mongoose.Schema({
  sensor_id: {
    type: Number, // <-- DOIT être Number !
    required: true,
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
});

module.exports = mongoose.model("RoomSensor", roomSensorSchema);
