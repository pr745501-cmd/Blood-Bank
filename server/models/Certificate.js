import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({

  donorId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  donorName:String,

  bloodGroup:String,

  city:String,

  donationDate:Date,

  certificateId:String,

  createdAt:{
    type:Date,
    default:Date.now
  }

});

export default mongoose.model("Certificate",certificateSchema);