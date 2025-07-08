import mongoose from "mongoose";

const sensorDetectionSchema = new mongoose.Schema({
  sensor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sensor",
    required: true,
  },
  action: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SensorDetection", sensorDetectionSchema);
