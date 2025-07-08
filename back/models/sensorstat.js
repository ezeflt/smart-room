import mongoose from "mongoose";

const sensorStatSchema = new mongoose.Schema({
  sensor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sensor",
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

export default mongoose.model("SensorStat", sensorStatSchema);
