import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Donor from "../models/Donor.js";


// 🩸 DONATE BLOOD
export const donateBlood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bloodGroup, location, units } = req.body;

    // 🔥 CREATE DONATION RECORD
    const donation = await Donation.create({
      user: userId,
      bloodGroup,
      location,
      units: units || 1
    });

    // 🔥 FIND DONOR
    let donor = await Donor.findOne({ user: userId });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // 🔥 UPDATE DONOR
    donor.donationCount = (donor.donationCount || 0) + 1;
    donor.lastDonationDate = new Date();

    await donor.save();

    // 🔥 SOCKET UPDATE
    const io = req.app.get("io");
    if (io) {
      io.emit("donationUpdated", {
        userId,
        donationCount: donor.donationCount
      });
    }

    res.json({
      message: "Donation recorded successfully",
      donation,
      donor
    });

  } catch (err) {
    console.error("Donate Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// 📊 DONATION ANALYTICS
export const getDonationStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const donations = await Donation.find({
      user: new mongoose.Types.ObjectId(userId)
    });

    const totalDonations = donations.length;

    const totalUnitsDonated = donations.reduce(
      (sum, d) => sum + (d.units || 1),
      0
    );

    const livesImpacted = totalUnitsDonated * 3;

    let lastDonationDate = null;
    let nextEligibleDate = null;

    let recoveryPercentage = 100;

    if (donations.length > 0) {
      const lastDonation = donations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      lastDonationDate = lastDonation.createdAt;

      // 42-day whole blood recovery cycle (matches dashboard)
      const RECOVERY_DAYS = 42;
      const nextDate = new Date(lastDonation.createdAt);
      nextDate.setDate(nextDate.getDate() + RECOVERY_DAYS);
      nextEligibleDate = nextDate;

      const diffDays = Math.floor((new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24));
      recoveryPercentage = Math.min(Math.round((diffDays / RECOVERY_DAYS) * 100), 100);
    }

    res.json({
      donationCount: totalDonations,
      livesSaved: livesImpacted,
      lastDonationDate,
      nextEligibleDate,
      totalUnitsDonated,
      recoveryPercentage
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching donation stats" });
  }
};



// 📜 DONATION HISTORY
export const getUserDonations = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const donations = await Donation.find({
      user: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 });

    res.json(donations);

  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ message: "Error fetching donation history" });
  }
};



// 📈 MONTHLY DONATION CHART
export const getMonthlyDonations = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const data = await Donation.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$units" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(data);

  } catch (error) {
    console.error("Monthly Error:", error);
    res.status(500).json({ message: "Error fetching monthly data" });
  }
};