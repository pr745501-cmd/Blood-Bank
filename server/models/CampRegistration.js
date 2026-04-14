import mongoose from "mongoose";

const campRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp",
      required: true,
    },

    bloodGroup: {
      type: String,
      uppercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    lastDonation: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["registered", "attended", "cancelled"],
      default: "registered",
    },

    // ✅ NEW: Track actual attendance time (important)
    attendedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


// ✅ Prevent duplicate registration
campRegistrationSchema.index({ userId: 1, campId: 1 }, { unique: true });


// ✅ AUTO SET attendedAt when status becomes attended
campRegistrationSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "attended") {
    this.attendedAt = new Date();
  }
  next();
});


export default mongoose.model("CampRegistration", campRegistrationSchema);