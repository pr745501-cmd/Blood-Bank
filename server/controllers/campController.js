import Camp from "../models/Camp.js";
import CampRegistration from "../models/CampRegistration.js";


/* ================= CREATE CAMP ================= */
export const createCamp = async (req, res) => {
  try {
    const camp = new Camp({
      ...req.body,
      createdBy: req.user.id,
    });

    await camp.save();
    res.status(201).json({ message: "Camp created", camp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= GET ALL CAMPS ================= */
export const getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find().sort({ createdAt: -1 });

    const result = await Promise.all(
      camps.map(async (camp) => {
        const registrations = await CampRegistration.find({
          campId: camp._id,
        }).populate("userId", "name email");

        return {
          ...camp._doc,
          registrations,
          registeredCount: registrations.length,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= GET SINGLE CAMP ================= */
export const getCampById = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: "Camp not found" });

    const registrations = await CampRegistration.find({
      campId: camp._id,
    }).populate("userId", "name email");

    res.json({
      ...camp._doc,
      registrations,
      registeredCount: registrations.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= REGISTER ================= */
export const registerForCamp = async (req, res) => {
  try {
    const { campId, bloodGroup, phone, lastDonation } = req.body;
    const userId = req.user.id;

    const camp = await Camp.findById(campId);
    if (!camp) return res.status(404).json({ message: "Camp not found" });

    const count = await CampRegistration.countDocuments({ campId });

    if (count >= camp.capacity) {
      return res.status(400).json({ message: "Camp is full" });
    }

    const already = await CampRegistration.findOne({ userId, campId });
    if (already) {
      return res.status(400).json({ message: "Already registered" });
    }

    const registration = new CampRegistration({
      userId,
      campId,
      bloodGroup,
      phone,
      lastDonation,
    });

    await registration.save();

    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* ================= MY CAMPS ================= */
export const getMyCamps = async (req, res) => {
  try {
    const userId = req.user.id;

    const camps = await CampRegistration.find({ userId })
      .populate("campId")
      .sort({ createdAt: -1 });

    res.json(camps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= DELETE ================= */
export const deleteCamp = async (req, res) => {
  try {
    await Camp.findByIdAndDelete(req.params.id);

    await CampRegistration.deleteMany({ campId: req.params.id });

    res.json({ message: "Camp deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};