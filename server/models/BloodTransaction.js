import mongoose from "mongoose";

const bloodTransactionSchema = new mongoose.Schema({

  bloodType: {
    type: String,
    required: true
  },

  transactionType: {
    type: String,
    enum: ["IN", "OUT"],
    required: true
  },

  component: {
    type: String,
    enum: ["wholeBlood", "plasma", "platelets", "rbc"],
    required: true
  },

  units: {
    type: Number,
    required: true
  },

  /* ===== IN fields ===== */
  source: {
    type: String,
    enum: ["Donor", "Camp", "Hospital", "External Purchase", "Other"],
    default: null
  },

  /* ===== OUT fields ===== */
  issuedTo: {
    type: String,
    default: null   // hospital / patient name
  },

  reason: {
    type: String,
    enum: ["Surgery", "Emergency", "Transfusion", "Research", "Expired Disposal", "Other"],
    default: null
  },

  notes: {
    type: String,
    default: ""
  },

  performedBy: {
    type: String,
    default: "Admin"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("BloodTransaction", bloodTransactionSchema);
