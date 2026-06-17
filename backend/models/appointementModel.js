import mongoose from "mongoose";

const appointementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  doctorId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payement: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
});

const appointementModel =
  mongoose.models.appointement ||
  mongoose.model("appointement", appointementSchema);

export default appointementModel;
