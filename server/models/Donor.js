import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required removed — admin-created donors have no linked user
    unique: true,
    sparse: true // allows multiple null/absent values
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    trim: true,
    lowercase: true
  },

  bloodGroup: {
    type: String,
    required: true,
    uppercase: true
  },

  city: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  mobile: {
    type: String,
    unique: true,
    sparse: true
  },

  gender: String,

  age: {
    type: Number,
    min: 18,
    max: 65
  },

  availability: {
    type: Boolean,
    default: true
  },

  donationCount: {
    type: Number,
    default: 0
  },

  lastDonationDate: {
    type: Date,
    default: null
  },

  latitude: Number,
  longitude: Number,

  eligibilityNotifiedAt: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);


// ✅ 🔥 IMPORTANT: METHOD TO UPDATE DONATION
donorSchema.methods.recordDonation = async function () {
  this.donationCount += 1;
  this.lastDonationDate = new Date();
  return await this.save();
};


const Donor =
  mongoose.models.Donor ||
  mongoose.model("Donor", donorSchema);

export default Donor;