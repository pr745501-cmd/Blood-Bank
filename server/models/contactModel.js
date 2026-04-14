import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
{
  /* USER LINK */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* BASIC INFO */
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    required: true
  },

  /* QUERY DETAILS */

  subject: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: [
      "General Inquiry",
      "Technical Issue",
      "Blood Donation Help",
      "Account Problem",
      "Emergency Support"
    ],
    default: "General Inquiry"
  },

  message: {
    type: String,
    required: true
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low"
  },

  /* ADMIN RESPONSE */

  adminReply: {
    type: String,
    default: ""
  },

  /* STATUS */

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  }

},
{ timestamps: true }
);

export default mongoose.model("Contact", contactSchema);