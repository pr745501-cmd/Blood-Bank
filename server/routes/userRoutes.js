import express from "express";
import User from "../models/User.js";
import Donor from "../models/Donor.js"; // ✅ IMPORTANT
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE PROFILE ================= */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    // ✅ SYNC DONOR
    if (req.body.bloodGroup) {
      await Donor.findOneAndUpdate(
        { user: req.user.id },
        { bloodGroup: req.body.bloodGroup }
      );
    }

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;