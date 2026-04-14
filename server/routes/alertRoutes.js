import express from "express";
import Alert from "../models/Alert.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/* ======================================================
   CREATE ALERT (ADMIN)
====================================================== */

router.post("/admin/alerts", async (req, res) => {

try{

const alert = new Alert(req.body);

await alert.save();

/* ===== REAL TIME ALERT ===== */

const io = req.app.get("io");

io.emit("newAlert", alert);

/* =========================== */

res.status(201).json({
message:"Emergency alert created successfully",
alert
});

}catch(err){

console.error("Create Alert Error:",err);

res.status(500).json({
message:"Error creating alert"
});

}

});


/* ======================================================
   GET ACTIVE ALERTS
====================================================== */

router.get("/alerts", verifyToken, async (req,res)=>{

try{

const alerts = await Alert.find({ status:"Active" })
.sort({ createdAt:-1 });

const updatedAlerts = alerts.map(alert=>{

const hasResponded = alert.responses.some(
r => r.user.toString() === req.user.id
);

return{
...alert._doc,
hasResponded
};

});

res.json(updatedAlerts);

}catch(err){

console.error("Fetch Alerts Error:",err);

res.status(500).json({
message:"Error fetching alerts"
});

}

});


/* ======================================================
   RESPOND TO ALERT (DONOR)
====================================================== */

router.post("/alerts/respond/:id", verifyToken, async(req,res)=>{

try{

const alertId = req.params.id;

const user = await User.findById(req.user.id);

if(!user){

return res.status(404).json({
message:"User not found"
});

}

const alert = await Alert.findById(alertId);

if(!alert){

return res.status(404).json({
message:"Alert not found"
});

}

/* ===== PREVENT DUPLICATE RESPONSE ===== */

const alreadyResponded = alert.responses.find(
r => r.user.toString() === user._id.toString()
);

if(alreadyResponded){

return res.json({
message:"You already responded to this alert"
});

}

/* ===== SAVE RESPONSE ===== */

alert.responses.push({

user:user._id,
name:user.name,
phone:user.phone,
bloodGroup:user.bloodGroup

});

await alert.save();

/* ===== REAL TIME DONOR RESPONSE ===== */

const io = req.app.get("io");

io.emit("donorResponded",{
alertId,
name:user.name,
bloodGroup:user.bloodGroup
});

/* ===================================== */

res.json({
message:"Response recorded successfully"
});

}catch(err){

console.error("Respond Alert Error:",err);

res.status(500).json({
message:"Error responding to alert"
});

}

});


/* ======================================================
   GET ALERT RESPONSES (ADMIN)
====================================================== */

router.get("/alerts/responses/:id", async(req,res)=>{

try{

const alert = await Alert.findById(req.params.id)
.populate("responses.user","name phone bloodGroup");

if(!alert){

return res.status(404).json({
message:"Alert not found"
});

}

res.json(alert.responses);

}catch(err){

console.error("Fetch Responses Error:",err);

res.status(500).json({
message:"Error fetching responses"
});

}

});


/* ======================================================
   RESOLVE ALERT (ADMIN)
====================================================== */

router.put("/alerts/resolve/:id", async(req,res)=>{

try{

const alert = await Alert.findById(req.params.id);

if(!alert){

return res.status(404).json({
message:"Alert not found"
});

}

alert.status = "Resolved";

await alert.save();

/* ===== REAL TIME ALERT RESOLVE ===== */

const io = req.app.get("io");

io.emit("alertResolved", alert._id);

/* =================================== */

res.json({
message:"Alert resolved successfully"
});

}catch(err){

console.error("Resolve Alert Error:",err);

res.status(500).json({
message:"Error resolving alert"
});

}

});


export default router;