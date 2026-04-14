import mongoose from "mongoose"

const alertSchema = new mongoose.Schema({

hospital:{
type:String,
required:true
},

bloodGroup:{
type:String,
required:true
},

units:{
type:Number
},

urgency:{
type:String
},

description:{
type:String
},

location:{
type:String
},

status:{
type:String,
default:"Active"
},

createdAt:{
type:Date,
default:Date.now
},

// ⭐ NEW FIELD
responses:[{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

name:String,
phone:String,
bloodGroup:String,

respondedAt:{
type:Date,
default:Date.now
}

}]

})

export default mongoose.model("Alert",alertSchema)