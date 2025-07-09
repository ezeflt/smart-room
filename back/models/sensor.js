import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  state: {
    type: Number,
  },
});

export default mongoose.model("Sensor", sensorSchema);
