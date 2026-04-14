import StockThreshold from "../models/StockThreshold.js";

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const DEFAULT_THRESHOLD = 10;

/* ================= GET ALL THRESHOLDS ================= */

export const getThresholds = async (req, res) => {
  try {
    // Ensure all 8 blood groups have a threshold document
    const existing = await StockThreshold.find({});
    const existingGroups = new Set(existing.map(r => r.bloodGroup));

    const missing = VALID_BLOOD_GROUPS.filter(g => !existingGroups.has(g));
    if (missing.length > 0) {
      await StockThreshold.insertMany(
        missing.map(bloodGroup => ({ bloodGroup, threshold: DEFAULT_THRESHOLD, alertedAt: null }))
      );
    }

    const all = await StockThreshold.find({}).sort({ bloodGroup: 1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE THRESHOLD ================= */

export const updateThreshold = async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const { threshold } = req.body;

    if (!VALID_BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    if (
      threshold === undefined ||
      threshold === null ||
      typeof threshold !== "number" ||
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      return res.status(400).json({ message: "Threshold must be a non-negative integer" });
    }

    const record = await StockThreshold.findOneAndUpdate(
      { bloodGroup },
      { threshold },
      { new: true, upsert: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
