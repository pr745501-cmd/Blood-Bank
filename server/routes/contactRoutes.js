import express from "express";
import Contact from "../models/contactModel.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= CREATE CONTACT MESSAGE ================= */

router.post("/create", verifyToken, async (req, res) => {

try{

const contact = new Contact({
user:req.user.id,
name:req.body.name,
email:req.body.email,
mobile:req.body.mobile,
subject:req.body.subject,
category:req.body.category,
priority:req.body.priority,
message:req.body.message,
status:"Pending"
});

await contact.save();

res.status(201).json({
success:true,
message:"Message sent successfully",
contact
});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

});


/* ================= USER QUERIES ================= */

router.get("/my", verifyToken, async (req,res)=>{

try{

const queries = await Contact.find({
user:req.user.id
}).sort({createdAt:-1});

res.json({
success:true,
queries
});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

});


/* ================= ADMIN GET ALL ================= */

router.get("/", verifyToken, isAdmin, async (req,res)=>{

try{

const contacts = await Contact.find()
.populate("user","name email")
.sort({createdAt:-1});

res.json({
success:true,
contacts
});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

});


/* ================= ADMIN REPLY ================= */

router.put("/reply/:id", verifyToken, isAdmin, async (req,res)=>{

try{

const query = await Contact.findById(req.params.id);

if(!query){
return res.status(404).json({
success:false,
message:"Query not found"
});
}

query.adminReply = req.body.reply;
query.status = "Resolved";

await query.save();

res.json({
success:true,
message:"Reply sent successfully",
query
});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

});

export default router;