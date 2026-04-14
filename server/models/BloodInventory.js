import mongoose from "mongoose";

const bloodInventorySchema = new mongoose.Schema({

bloodType:{
type:String,
required:true
},

wholeBlood:{
type:Number,
default:0
},

plasma:{
type:Number,
default:0
},

platelets:{
type:Number,
default:0
},

rbc:{
type:Number,
default:0
},

expiringSoon:{
type:Number,
default:0
},

source:{
type:String,
enum:["Donor","Camp","Hospital","External Purchase","Other"],
default:"Other"
},

status:{
type:String,
default:"Adequate"
},

updatedAt:{
type:Date,
default:Date.now
}

});

export default mongoose.model("BloodInventory",bloodInventorySchema);