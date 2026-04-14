import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

patientName:{
type:String,
required:true
},

bloodGroup:{
type:String,
required:true
},

units:{
type:Number,
required:true
},

hospital:{
type:String,
required:true
},

city:{
type:String,
required:true
},

/* ⭐ NEW FIELDS */

contactName:{
type:String,
required:true
},

contactPhone:{
type:String,
required:true
},

urgency:{
type:String,
enum:["Normal","Urgent","Critical"],
default:"Normal"
},

requiredDate:{
type:Date
},

notes:{
type:String
},

/* ⭐ ADMIN ASSIGNED DONOR */

assignedDonor:{
type:mongoose.Schema.Types.ObjectId,
ref:"Donor",
default:null
},

/* ⭐ REQUEST STATUS */

status:{
type:String,
enum:["Pending","Approved","Assigned","Completed","Rejected"],
default:"Pending"
}

},
{timestamps:true}
);

const BloodRequest = mongoose.model("BloodRequest",bloodRequestSchema);

export default BloodRequest;