import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
  },
});

export default mongoose.model("Room", roomSchema);
