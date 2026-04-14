import express from "express";
import Donor from "../models/Donor.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";

const router = express.Router();

// Public stats — no auth required
router.get("/", async (req, res) => {
  try {
    const [totalDonors, totalDonations, totalAllDonations, totalUsers, totalRequests, unitsAgg] = await Promise.all([
      Donor.countDocuments(),
      Donation.countDocuments({ verificationStatus: "approved" }),
      Donation.countDocuments(),
      User.countDocuments(),
      BloodRequest.countDocuments(),
      Donation.aggregate([
        { $match: { verificationStatus: "approved" } },
        { $group: { _id: null, total: { $sum: "$units" } } }
      ])
    ]);

    const totalUnits = unitsAgg[0]?.total || 0;

    res.json({
      totalDonors,
      totalDonations,
      totalAllDonations,
      totalUsers,
      totalRequests,
      totalUnits,
      livesSaved: totalDonors * 3,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;
