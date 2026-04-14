import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bloodGroup: String,

  date: {
    type: Date,
    default: Date.now
  },

  location: String,

  type: {
    type: String,
    default: "blood"
  },

  // ✅ ADD THIS
  units: {
    type: Number,
    default: 1   // usually 1 unit per donation
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true, minimize: false });

// Allow createdAt override for sync
donationSchema.set('timestamps', { createdAt: 'createdAt', updatedAt: 'updatedAt' });

export default mongoose.model("Donation", donationSchema);