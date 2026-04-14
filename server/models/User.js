import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC ================= */
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "admin", "hospital"],
      default: "user"
    },

    /* ================= CONTACT ================= */
    phone: {
      type: String,
      default: ""
    },

    city: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    /* ================= BLOOD ================= */
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", ""],
      default: ""
    },

    availability: {
      type: Boolean,
      default: true
    },

    donations: {
      type: Number,
      default: 0
    },

    /* ================= NEW FIELD (🔥 IMPORTANT) ================= */
    lastDonation: {
      type: String,
      default: ""
    },

    /* ================= PERSONAL ================= */
    dob: {
      type: String,
      default: ""
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: ""
    },

    /* ================= EMERGENCY ================= */
    emergencyContact: {
      type: String,
      default: ""
    },

    emergencyName: {
      type: String,
      default: ""
    },

    /* ================= MEDICAL ================= */
    allergies: {
      type: String,
      default: ""
    },

    medications: {
      type: String,
      default: ""
    },

    conditions: {
      type: String,
      default: ""
    },

    surgery: {
      type: String,
      default: ""
    },

    /* ================= PREFERENCES ================= */
    preferredCenter: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);