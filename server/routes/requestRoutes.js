import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { deductFromInventory } from "../utils/inventoryHelper.js";
import * as matchingEngine from "../services/matchingEngine.js";

const router = express.Router();

/* ================= CREATE BLOOD REQUEST ================= */

router.post("/create", verifyToken, async (req, res) => {
  try {

    const {
      patientName,
      bloodGroup,
      units,
      hospital,
      city,
      contactName,
      contactPhone,
      urgency,
      requiredDate,
      notes
    } = req.body;

    if (!patientName || !bloodGroup || !units || !hospital || !city) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const request = new BloodRequest({
      user: req.user.id,
      patientName,
      bloodGroup,
      units,
      hospital,
      city,
      contactName,
      contactPhone,
      urgency,
      requiredDate,
      notes
    });

    await request.save();

    // Trigger async donor matching — does not delay the response
    const io = req.app.get("io");
    matchingEngine.runForRequest(request._id, io).catch(console.error);

    res.status(201).json({
      message: "Blood Request Created Successfully",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= VIEW MY REQUESTS ================= */

router.get("/my", verifyToken, async (req, res) => {
  try {

    const requests = await BloodRequest.find({ user: req.user.id })
      .populate("assignedDonor", "name bloodGroup city mobile")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADMIN - VIEW ALL REQUESTS ================= */

router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {

    const requests = await BloodRequest.find()
      .populate("user", "name email")
      .populate("assignedDonor", "name bloodGroup city mobile")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADMIN - UPDATE STATUS ================= */

router.put("/update/:id", verifyToken, isAdmin, async (req, res) => {
  try {

    const { status } = req.body;

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }

    request.status = status;
    await request.save();

    res.json({
      message: "Request Status Updated Successfully",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADMIN - ASSIGN DONOR ================= */

router.put("/assign/:id", verifyToken, isAdmin, async (req, res) => {
  try {

    const { donorId } = req.body;

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }

    if (request.assignedDonor) {
      return res.status(400).json({
        message: "Donor already assigned"
      });
    }

    request.assignedDonor = donorId;
    request.status = "Assigned";

    await request.save();

    // 🩸 AUTO DEDUCT FROM INVENTORY
    await deductFromInventory({
      bloodType:   request.bloodGroup,
      units:       request.units,
      issuedTo:    request.patientName + " · " + request.hospital,
      reason:      "Transfusion",
      notes:       `Assigned for request by ${request.patientName}`,
      performedBy: "Admin"
    });

    res.json({
      message: "Donor Assigned Successfully",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADMIN - MARK COMPLETED ================= */

router.put("/complete/:id", verifyToken, isAdmin, async (req, res) => {
  try {

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }

    request.status = "Completed";

    await request.save();

    res.json({
      message: "Request Marked as Completed",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/* ================= ADMIN - DELETE REQUEST ================= */

router.delete("/delete/:id", verifyToken, isAdmin, async (req, res) => {
  try {

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);

    res.json({
      message: "Blood Request Deleted Successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;