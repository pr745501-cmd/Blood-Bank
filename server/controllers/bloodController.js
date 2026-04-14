import BloodInventory from "../models/BloodInventory.js";
import BloodTransaction from "../models/BloodTransaction.js";
import Alert from "../models/Alert.js";
import { checkAndNotify } from "../services/alertService.js";

/* ================= HELPERS ================= */

const COMPONENTS = ["wholeBlood", "plasma", "platelets", "rbc"];

const recalcStatus = (inventory) => {
  const total = COMPONENTS.reduce((s, c) => s + (inventory[c] || 0), 0);
  if (total < 50)       inventory.status = "Critical";
  else if (total < 100) inventory.status = "Low";
  else                  inventory.status = "Adequate";
  return total;
};

/* ================= GET INVENTORY ================= */

export const getInventory = async (req, res) => {
  try {
    const inventory = await BloodInventory.find().sort({ bloodType: 1 });
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching inventory" });
  }
};

/* ================= ADD STOCK (IN) ================= */

export const addStock = async (req, res) => {
  try {
    const {
      bloodType,
      wholeBlood = 0,
      plasma = 0,
      platelets = 0,
      rbc = 0,
      expiringSoon = 0,
      source = "Other",
      notes = "",
      performedBy = "Admin"
    } = req.body;

    let inventory = await BloodInventory.findOne({ bloodType });

    if (!inventory) {
      inventory = new BloodInventory({
        bloodType,
        wholeBlood: Number(wholeBlood),
        plasma: Number(plasma),
        platelets: Number(platelets),
        rbc: Number(rbc),
        expiringSoon: Number(expiringSoon),
        source
      });
    } else {
      inventory.wholeBlood    += Number(wholeBlood);
      inventory.plasma        += Number(plasma);
      inventory.platelets     += Number(platelets);
      inventory.rbc           += Number(rbc);
      inventory.expiringSoon   = Number(expiringSoon);
      inventory.source         = source;
    }

    inventory.updatedAt = new Date();
    const total = recalcStatus(inventory);
    await inventory.save();

    // Check low-stock threshold and notify admins if needed
    await checkAndNotify(bloodType, total, req.app.get("io"));

    /* ===== LOG TRANSACTIONS FOR EACH COMPONENT ADDED ===== */
    const txPromises = [];
    const componentMap = { wholeBlood, plasma, platelets, rbc };
    for (const [component, val] of Object.entries(componentMap)) {
      if (Number(val) > 0) {
        txPromises.push(
          BloodTransaction.create({
            bloodType,
            transactionType: "IN",
            component,
            units: Number(val),
            source,
            notes,
            performedBy
          })
        );
      }
    }
    await Promise.all(txPromises);

    /* ===== AUTO ALERT IF CRITICAL ===== */
    if (inventory.status === "Critical") {
      const existingAlert = await Alert.findOne({ bloodGroup: bloodType, status: "Active" });
      if (!existingAlert) {
        await Alert.create({
          hospital: "Blood Bank Center",
          bloodGroup: bloodType,
          units: 10,
          urgency: "Critical",
          description: `Critical shortage of ${bloodType} blood. Urgent donation required.`,
          location: "City Blood Bank",
          status: "Active"
        });
      }
    }

    res.json({ message: "Stock updated successfully", inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating stock" });
  }
};

/* ================= DISPENSE STOCK (OUT) ================= */

export const dispenseStock = async (req, res) => {
  try {
    const {
      bloodType,
      component,
      units,
      issuedTo,
      reason = "Other",
      notes = "",
      performedBy = "Admin"
    } = req.body;

    if (!bloodType || !component || !units || !issuedTo) {
      return res.status(400).json({ message: "bloodType, component, units and issuedTo are required" });
    }

    if (!COMPONENTS.includes(component)) {
      return res.status(400).json({ message: "Invalid component" });
    }

    const inventory = await BloodInventory.findOne({ bloodType });
    if (!inventory) {
      return res.status(404).json({ message: "Blood type not found in inventory" });
    }

    if (inventory[component] < Number(units)) {
      return res.status(400).json({
        message: `Insufficient ${component} stock. Available: ${inventory[component]} units`
      });
    }

    inventory[component] -= Number(units);
    inventory.updatedAt   = new Date();
    const total = recalcStatus(inventory);
    await inventory.save();

    // Check low-stock threshold and notify admins if needed
    await checkAndNotify(bloodType, total, req.app.get("io"));

    /* ===== LOG TRANSACTION ===== */
    await BloodTransaction.create({
      bloodType,
      transactionType: "OUT",
      component,
      units: Number(units),
      issuedTo,
      reason,
      notes,
      performedBy
    });

    /* ===== AUTO ALERT IF CRITICAL AFTER DISPENSE ===== */
    if (inventory.status === "Critical") {
      const existingAlert = await Alert.findOne({ bloodGroup: bloodType, status: "Active" });
      if (!existingAlert) {
        await Alert.create({
          hospital: "Blood Bank Center",
          bloodGroup: bloodType,
          units: 10,
          urgency: "Critical",
          description: `Critical shortage of ${bloodType} blood after dispensing. Urgent donation required.`,
          location: "City Blood Bank",
          status: "Active"
        });
      }
    }

    res.json({ message: "Stock dispensed successfully", inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error dispensing stock" });
  }
};

/* ================= GET TRANSACTIONS ================= */

export const getTransactions = async (req, res) => {
  try {
    const { bloodType, type, limit = 100 } = req.query;
    const filter = {};
    if (bloodType) filter.bloodType = bloodType;
    if (type)      filter.transactionType = type;

    const transactions = await BloodTransaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

/* ================= DELETE STOCK ================= */

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BloodInventory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting stock" });
  }
};
