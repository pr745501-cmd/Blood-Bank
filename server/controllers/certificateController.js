import Certificate from "../models/Certificate.js";
import Donor from "../models/Donor.js";


/* ================= CREATE CERTIFICATE ================= */

export const createCertificate = async (req, res) => {
  try {
    const {
      donorId,
      donorName,
      bloodGroup,
      hospital,
      donationDate
    } = req.body;

    const certificateId = "BC-" + Date.now();

    // ✅ 1. CREATE CERTIFICATE
    const certificate = await Certificate.create({
      donorId,
      donorName,
      bloodGroup,
      hospital,
      donationDate: donationDate || new Date(),
      certificateId
    });

    // ✅ 2. ENSURE DONOR EXISTS
    let donor = await Donor.findOne({ user: donorId });

    if (!donor) {
      donor = await Donor.create({
        user: donorId,
        name: donorName,
        bloodGroup,
        donationCount: 0
      });
    }

    // 🔥 3. UPDATE DONOR (MAIN LOGIC)
    donor.donationCount += 1;
    donor.lastDonationDate = donationDate || new Date();

    await donor.save();

    // 🔔 REAL-TIME: notify the donor their certificate is ready
    const io = req.app.get("io");
    if (io) io.emit("certificateIssued", { donorId, certificateId, donorName });

    res.status(201).json({
      success: true,
      message: "Certificate + Donor updated successfully",
      certificate
    });

  } catch (error) {
    console.error("❌ Certificate Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= GET USER CERTIFICATES ================= */

export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate
      .find({ donorId: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      certificates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= GET ALL CERTIFICATES (ADMIN) ================= */

export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate
      .find()
      .populate("donorId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      certificates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= DELETE CERTIFICATE ================= */

export const deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    // 🔥 decrease donation count safely
    const donor = await Donor.findOne({ user: cert.donorId });

    if (donor && donor.donationCount > 0) {
      donor.donationCount -= 1;
      await donor.save();
    }

    await cert.deleteOne();

    res.json({
      success: true,
      message: "Certificate deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};