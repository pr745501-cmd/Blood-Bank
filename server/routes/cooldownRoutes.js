import express from "express";
import mongoose from "mongoose";
import Donor from "../models/Donor.js";
import { computeCooldownStatus } from "../services/cooldownService.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= GET COOLDOWN STATUS ================= */

router.get("/status/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const donor = await Donor.findOne({ user: userId });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const status = computeCooldownStatus(donor.lastDonationDate);

    res.json({
      isEligible: status.isEligible,
      daysRemaining: status.daysRemaining,
      nextEligibleDate: status.nextEligibleDate,
      lastDonationDate: donor.lastDonationDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
