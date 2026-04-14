import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Certificate from "../models/Certificate.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { addToInventory } from "../utils/inventoryHelper.js";
import { COOLDOWN_DAYS } from "../services/cooldownService.js";

const router = express.Router();

/* ================= GET ALL DONORS ================= */
router.get("/all", async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .lean();

    donors.forEach(d => { d.availability = Boolean(d.availability); });

    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= GET DONOR BY ID ================= */
router.get("/:id", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate("user");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const fullData = {
      ...donor._doc,
      ...(donor.user?._doc || {}),
      availability: Boolean(donor.availability)
    };

    res.json(fullData);
  } catch (error) {
    res.status(500).json({ message: "Invalid donor ID" });
  }
});

/* ================= GET DONOR BY USER ================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const donor = await Donor.findOne({
      user: new mongoose.Types.ObjectId(req.params.userId)
    }).populate("user");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const fullData = {
      ...donor._doc,
      ...(donor.user?._doc || {}),
      availability: Boolean(donor.availability)
    };

    res.json(fullData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= 🔥 NEW: USER DONATION API ================= */
router.post("/donate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const donor = await Donor.findOne({ user: userId });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // 🔥 CHECK ELIGIBILITY — 90-day cooldown
    if (donor.lastDonationDate) {
      const last = new Date(donor.lastDonationDate);
      const next = new Date(last);
      next.setDate(last.getDate() + COOLDOWN_DAYS);

      const today = new Date();

      if (today < next) {
        return res.status(400).json({
          message: `You can donate after ${next.toDateString()}`
        });
      }
    }

    // ✅ ALLOWED → UPDATE DONATION
    const donationDate = new Date();
    donor.donationCount = (donor.donationCount || 0) + 1;
    donor.lastDonationDate = donationDate;
    donor.availability = false;
    donor.eligibilityNotifiedAt = null;

    await donor.save();

    // Also set User.availability = false
    if (donor.user) {
      await User.findByIdAndUpdate(donor.user, { availability: false }).catch(err =>
        console.warn(`Could not update User availability for donor ${donor._id}:`, err.message)
      );
    }

    // ✅ CREATE Donation record — PENDING until admin approves
    await Donation.create({
      user: userId,
      bloodGroup: donor.bloodGroup,
      location: donor.city || "",
      units: 1,
      date: donationDate,
      verificationStatus: "pending"
    });

    // ❌ Certificate NOT created here — admin must approve first

    // 🩸 AUTO ADD TO INVENTORY
    await addToInventory({
      bloodType:   donor.bloodGroup,
      units:       1,
      component:   "wholeBlood",
      source:      "Donor",
      notes:       `Donation by ${donor.name}`,
      performedBy: donor.name
    });

    // 🔥 SOCKET UPDATE
    const io = req.app.get("io");
    if (io) {
      io.emit("donationUpdated", {
        userId,
        donationCount: donor.donationCount
      });
    }

    res.json({
      success: true,
      message: "Donation recorded successfully",
      donor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= NEXT ELIGIBLE DATE ================= */
router.get("/next/:userId", async (req, res) => {
  try {
    const donor = await Donor.findOne({
      user: new mongoose.Types.ObjectId(req.params.userId)
    });

    if (!donor || !donor.lastDonationDate) {
      return res.json({ nextEligible: null });
    }

    const last = new Date(donor.lastDonationDate);
    const next = new Date(last);
    next.setDate(last.getDate() + COOLDOWN_DAYS);

    res.json({ nextEligible: next });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= BECOME DONOR ================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, email, city, address, mobile, gender, age } = req.body;
    const userId = req.user.id;

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    let donor = await Donor.findOne({ user: userId });

    if (donor) {
      donor.name = name;
      donor.email = email;
      donor.city = city;
      donor.address = address;
      donor.mobile = mobile;
      donor.gender = gender;
      donor.age = age;
      // only update bloodGroup from user profile if form didn't provide one
      donor.bloodGroup = req.body.bloodGroup || userData.bloodGroup || donor.bloodGroup;

      await donor.save();
    } else {
      donor = new Donor({
        user: userId,
        name,
        email,
        bloodGroup: req.body.bloodGroup || userData.bloodGroup,
        city,
        address,
        mobile,
        gender,
        age,
        availability: false,
        lastDonationDate: null,
        donationCount: 0
      });

      await donor.save();
    }

    res.json({ donor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= APPROVE DONATION (ADMIN) ================= */
router.patch("/approve/:id", verifyToken, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    donor.donationCount = (donor.donationCount || 0) + 1;
    donor.lastDonationDate = new Date();
    donor.availability = false;
    donor.eligibilityNotifiedAt = null;

    await donor.save();

    // Also set User.availability = false
    if (donor.user) {
      await User.findByIdAndUpdate(donor.user, { availability: false }).catch(err =>
        console.warn(`Could not update User availability for donor ${donor._id}:`, err.message)
      );
    }

    // 🩸 AUTO ADD TO INVENTORY
    await addToInventory({
      bloodType:   donor.bloodGroup,
      units:       1,
      component:   "wholeBlood",
      source:      "Donor",
      notes:       `Admin approved donation by ${donor.name}`,
      performedBy: "Admin"
    });

    const certificate = new Certificate({
      donorId: donor.user,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      donationDate: new Date(),
      certificateId: "BC-" + Date.now()
    });

    await certificate.save();

    res.json({ success: true, donor });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= SEARCH DONORS ================= */
router.get("/search/:bloodGroup", (req, res, next) => {
  // Optional auth: populate req.user if token present, but never block
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch (_) { /* invalid token — treat as unauthenticated */ }
  }
  next();
}, async (req, res) => {
  try {
    const bloodGroup = decodeURIComponent(req.params.bloodGroup);

    const filter = { bloodGroup };
    if (req.user?.id) filter.user = { $ne: req.user.id };

    const donors = await Donor.find(filter)
      .populate("user")
      .lean();

    donors.forEach(d => d.availability = Boolean(d.availability));

    donors.sort((a, b) => b.availability - a.availability);

    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/status", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    const donor = await Donor.findOne({ user: userId });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    donor.availability = availability;

    await donor.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      donor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating status" });
  }
});
export default router;