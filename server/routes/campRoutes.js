import express from "express";
import {
  createCamp,
  getAllCamps,
  getCampById,
  registerForCamp,
  getMyCamps,
  deleteCamp,
} from "../controllers/campController.js";
import CampRegistration from "../models/CampRegistration.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */
router.post("/", verifyToken, isAdmin, createCamp);
router.delete("/:id", verifyToken, isAdmin, deleteCamp);

/* ================= USER ROUTES ================= */
router.get("/", getAllCamps);
router.get("/my", verifyToken, getMyCamps);

// Cancel a registration
router.patch("/cancel/:regId", verifyToken, async (req, res) => {
  try {
    const reg = await CampRegistration.findById(req.params.regId);
    if (!reg) return res.status(404).json({ message: "Registration not found" });
    if (reg.userId.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    if (reg.status !== "registered") return res.status(400).json({ message: "Cannot cancel this registration" });
    reg.status = "cancelled";
    await reg.save();
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Camp
router.get("/:id", getCampById);

export default router;