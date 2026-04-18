import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: false
    },
    type: {
      type: String,
      enum: ["donorMatch", "alert", "certificate", "eligibility", "low_stock"],
      default: "donorMatch"
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate notifications per donor per request (only when request exists)
notificationSchema.index({ user: 1, request: 1 }, { unique: true, sparse: true });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
