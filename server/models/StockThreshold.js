import mongoose from "mongoose";

const stockThresholdSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
      unique: true
    },
    threshold: {
      type: Number,
      default: 10,
      min: 0
    },
    alertedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const StockThreshold =
  mongoose.models.StockThreshold ||
  mongoose.model("StockThreshold", stockThresholdSchema);

export default StockThreshold;
