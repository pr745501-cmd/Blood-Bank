import express from "express";
import mongoose from "mongoose";
import Donor from "../models/Donor.js";
import { computeCooldownStatus } from "../services/cooldownService.js";

import {
  getUserDonations,
  getMonthlyDonations
} from "../controllers/donationController.js";

const router = express.Router();


// 📊 EXISTING STATS (UNCHANGED)
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const donor = await Donor.findOne({ user: userId });

    if (!donor) {
      return res.json({
        donationCount: 0,
        livesSaved: 0,
        recoveryPercentage: 100,
        bloodGroup: null,
        lastDonationDate: null,
        nextEligibleDate: null
      });
    }

    const donationCount = donor.donationCount || 0;
    const livesSaved = donationCount * 3;

    // sum units from actual Donation records for accuracy
    const Donation = (await import("../models/Donation.js")).default;
    const donations = await Donation.find({ user: userId }).lean();
    const totalUnitsDonated = donations.reduce((sum, d) => sum + (d.units || 1), 0);

    let recoveryPercentage = 100;
    let nextEligibleDate = null;

    if (donor.lastDonationDate) {
      const cooldown = computeCooldownStatus(donor.lastDonationDate);
      recoveryPercentage = Math.round(((90 - cooldown.daysRemaining) / 90) * 100);
      nextEligibleDate = cooldown.nextEligibleDate;
    }

    res.json({
      donationCount,
      livesSaved,
      totalUnitsDonated,
      recoveryPercentage: Math.round(recoveryPercentage),
      bloodGroup: donor.bloodGroup,
      lastDonationDate: donor.lastDonationDate,
      nextEligibleDate
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// 📜 NEW ROUTES
router.get("/donations/:userId", getUserDonations);
router.get("/monthly/:userId", getMonthlyDonations);

export default router;