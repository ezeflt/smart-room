import mongoose from "mongoose";

const userSensorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sensor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sensor",
    required: true,
  },
});

// Assure unicité user-sensor
userSensorSchema.index({ user_id: 1, sensor_id: 1 }, { unique: true });

export default mongoose.model("UserSensor", userSensorSchema);
