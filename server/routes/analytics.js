import express from "express";
import Donation from "../models/Donation.js";
import Donor from "../models/Donor.js";

const router = express.Router();

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// 📊 Monthly Donations — real data from DB (last 6 months)
router.get("/donations", async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const raw = await Donation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          donations: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fill all 6 months even if some have 0
    const result = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const found = raw.find(
        r => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1
      );
      return { month: MONTH_NAMES[d.getMonth()], donations: found?.donations || 0 };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🩸 Blood Group Distribution — real donor counts from DB
router.get("/blood-groups", async (req, res) => {
  try {
    const raw = await Donor.aggregate([
      { $match: { bloodGroup: { $ne: null, $ne: "" } } },
      { $group: { _id: "$bloodGroup", units: { $sum: 1 } } },
      { $sort: { units: -1 } }
    ]);

    const result = raw.map(r => ({ group: r._id, units: r.units }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
