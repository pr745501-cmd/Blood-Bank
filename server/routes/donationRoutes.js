import express from "express";
import {
  donateBlood,
  getDonationStats,
  getUserDonations,
  getMonthlyDonations
} from "../controllers/donationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/donate", verifyToken, donateBlood);
router.get("/stats/:userId", getDonationStats);
router.get("/history/:userId", getUserDonations);
router.get("/monthly/:userId", getMonthlyDonations);

// Per-user analytics: cumulative units over time + status breakdown
router.get("/analytics/:userId", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const Donation = (await import("../models/Donation.js")).default;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const uid = new mongoose.Types.ObjectId(userId);

    const [monthly, statusBreakdown, totalUnitsAgg] = await Promise.all([
      // Monthly units donated (last 12 months)
      Donation.aggregate([
        { $match: { user: uid, createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, units: { $sum: "$units" }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      // Status breakdown
      Donation.aggregate([
        { $match: { user: uid } },
        { $group: { _id: "$verificationStatus", count: { $sum: 1 } } }
      ]),
      // Total units
      Donation.aggregate([
        { $match: { user: uid } },
        { $group: { _id: null, total: { $sum: "$units" } } }
      ])
    ]);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const monthlyFilled = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const found = monthly.find(r => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
      return { month: MONTHS[d.getMonth()], units: found?.units || 0, count: found?.count || 0 };
    });

    res.json({
      monthly: monthlyFilled,
      statusBreakdown: statusBreakdown.map(s => ({ status: s._id || "pending", count: s.count })),
      totalUnits: totalUnitsAgg[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;