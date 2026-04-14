import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";
import Donation from "../models/Donation.js";
import Certificate from "../models/Certificate.js";
import Alert from "../models/Alert.js";import { Parser } from "json2csv";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import * as matchingEngine from "../services/matchingEngine.js";
import { computeCooldownStatus } from "../services/cooldownService.js";

const router = express.Router();

/* ================= VIEW ALL USERS ================= */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE USER ================= */
router.delete("/user/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    await user.deleteOne();

    res.json({ message: "User Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADD DONOR ================= */
router.post("/add-donor", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, mobile, email, age, gender, bloodGroup, address, lastDonationDate } = req.body;

    /* ===== AUTO-CREATE USER ACCOUNT ===== */
    let user = null;
    if (email) {
      const existing = await User.findOne({ email });
      if (existing) {
        user = existing;
      } else {
        const tempPassword = "123456";
        const hashed = await bcrypt.hash(tempPassword, 10);
        user = await User.create({
          name,
          email,
          password: hashed,
          phone: mobile || "",
          bloodGroup: bloodGroup || "",
          city: address || "",
          gender: gender?.toLowerCase() || "",
          role: "user"
        });
      }
    }

    /* ===== CREATE DONOR LINKED TO USER ===== */
    const donor = new Donor({
      ...req.body,
      user: user?._id || undefined,
      availability: true
    });

    await donor.save();

    /* ===== AUTO-CREATE DONATION RECORD if lastDonationDate provided ===== */
    if (user?._id && lastDonationDate) {
      await Donation.create({
        user: user._id,
        bloodGroup: bloodGroup || "",
        location: address || "",
        units: 1,
        date: new Date(lastDonationDate),
        verificationStatus: "approved"
      });
    }

    // REAL-TIME EVENT
    const io = req.app.get("io");
    io.emit("newDonor", donor);

    res.status(201).json({
      message: "Donor Added Successfully",
      donor,
      userCreated: !!user,
      userId: user?._id,
      loginCredentials: user ? { email: user.email, password: "123456" } : null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DONOR PROFILE (ADMIN VIEW) ================= */
router.get("/donor-profile/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate("user", "-password").lean();
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    const donations = donor.user
      ? await Donation.find({ user: donor.user._id }).sort({ createdAt: -1 })
      : [];

    const certificates = donor.user
      ? await Certificate.find({ donorId: donor.user._id }).sort({ donationDate: -1 })
      : [];

    res.json({ donor, donations, certificates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= VIEW ALL DONORS ================= */
router.get("/donors", verifyToken, isAdmin, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 }).lean();

    const enriched = donors.map(donor => {
      const { isEligible, daysRemaining } = computeCooldownStatus(donor.lastDonationDate);
      return { ...donor, isEligible, daysRemaining };
    });

    res.json(enriched);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE DONOR ================= */
router.delete("/donor/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({ message: "Donor Not Found" });
    }

    await donor.deleteOne();

    const io = req.app.get("io");
    io.emit("deleteDonor", donor._id);

    res.json({ message: "Donor Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE DONOR ================= */
router.put("/donor/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Donor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const io = req.app.get("io");
    io.emit("updateDonor", updated);

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= VIEW ALL CONTACT QUERIES ================= */
router.get("/queries", verifyToken, isAdmin, async (req, res) => {
  try {
    const queries = await BloodRequest.find().sort({ createdAt: -1 });

    res.json(queries);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE QUERY ================= */
router.delete("/query/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await BloodRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Query Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADMIN STATS ================= */
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalRequests,
      pendingRequests,
      totalDonations,
      totalCertificates,
      activeAlerts,
      bloodStats,
      requestStatusStats,
      recentRequests,
      recentDonors,
      monthlyDonations,
      urgencyStats
    ] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: "Pending" }),
      Donation.countDocuments(),
      Certificate.countDocuments(),
      Alert.countDocuments({ status: "Active" }),

      // blood group distribution from donors
      Donor.aggregate([
        { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // request status breakdown
      BloodRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      // 5 most recent blood requests
      BloodRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("patientName bloodGroup hospital urgency status createdAt city units"),

      // 5 most recent donors
      Donor.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name bloodGroup city donationCount lastDonationDate availability"),

      // monthly donations for last 6 months
      Donation.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            total: { $sum: "$units" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // urgency breakdown
      BloodRequest.aggregate([
        { $group: { _id: "$urgency", count: { $sum: 1 } } }
      ])
    ]);

    const totalUnitsDonated = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: "$units" } } }
    ]);

    res.json({
      totalUsers,
      totalDonors,
      totalRequests,
      pendingRequests,
      totalDonations,
      totalCertificates,
      activeAlerts,
      totalUnitsDonated: totalUnitsDonated[0]?.total || 0,
      livesSaved: (totalUnitsDonated[0]?.total || 0) * 3,
      bloodStats,
      requestStatusStats,
      recentRequests,
      recentDonors,
      monthlyDonations,
      urgencyStats
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADMIN - MANUAL DONOR MATCHING TRIGGER ================= */

router.post("/match/:requestId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    const io = req.app.get("io");
    const { matched } = await matchingEngine.runForRequest(requestId, io);

    res.json({
      message: `Matching complete. ${matched} donor(s) newly notified.`,
      matched
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= EXPORT DONORS CSV ================= */

router.get("/export-donors", verifyToken, isAdmin, async (req, res) => {
  try {

    const donors = await Donor.find();

    const fields = [
      "name",
      "bloodGroup",
      "city",
      "mobile",
      "gender",
      "age",
      "availability"
    ];

    const parser = new Parser({ fields });

    const csv = parser.parse(donors);

    res.header("Content-Type", "text/csv");
    res.attachment("donors.csv");

    return res.send(csv);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
});

/* ================= ALL DONATIONS (ADMIN) ================= */

router.get("/all-donations", verifyToken, isAdmin, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("user", "name email bloodGroup city")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= VERIFY DONATION (ADMIN) ================= */

router.put("/donation/:id/verify", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    ).populate("user", "name email bloodGroup city");

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // ✅ Issue certificate only when APPROVED
    if (status === "approved" && donation.user) {
      const alreadyExists = await Certificate.findOne({
        donorId: donation.user._id,
        donationDate: donation.date
      });

      if (!alreadyExists) {
        await Certificate.create({
          donorId: donation.user._id,
          donorName: donation.user.name,
          bloodGroup: donation.bloodGroup || donation.user.bloodGroup,
          city: donation.user.city || "",
          donationDate: donation.date || donation.createdAt,
          certificateId: "BC-" + Date.now()
        });
      }
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE REJECTED DONATIONS (CLEANUP) ================= */

router.delete("/donations/rejected", verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await Donation.deleteMany({ verificationStatus: "rejected" });
    res.json({ message: `Deleted ${result.deletedCount} rejected record(s).`, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Creates donation records for donors who have lastDonationDate but no Donation record

router.post("/sync-donations", verifyToken, isAdmin, async (req, res) => {
  try {
    const donors = await Donor.find({
      lastDonationDate: { $ne: null },
      user: { $ne: null }
    }).lean();

    let created = 0;

    for (const donor of donors) {
      // Only skip if an approved/pending record already exists
      const existing = await Donation.findOne({
        user: donor.user,
        verificationStatus: { $in: ["approved", "pending"] }
      });
      if (!existing) {
        const donationDate = new Date(donor.lastDonationDate);
        await Donation.collection.insertOne({
          user: donor.user,
          bloodGroup: donor.bloodGroup || "",
          location: donor.city || donor.address || "",
          units: 1,
          date: donationDate,
          type: "blood",
          verificationStatus: "approved",
          createdAt: donationDate,
          updatedAt: donationDate
        });
        created++;
      }
    }

    res.json({ message: `Synced ${created} missing donation record(s).`, created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;