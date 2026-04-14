import BloodInventory from "../models/BloodInventory.js";
import BloodTransaction from "../models/BloodTransaction.js";
import Alert from "../models/Alert.js";

/* ================= RECALC STATUS ================= */
const recalcStatus = (inv) => {
  const total = inv.wholeBlood + inv.plasma + inv.platelets + inv.rbc;
  if (total < 50)       inv.status = "Critical";
  else if (total < 100) inv.status = "Low";
  else                  inv.status = "Adequate";
};

/* ================= AUTO ALERT IF CRITICAL ================= */
const autoAlert = async (bloodType) => {
  const existing = await Alert.findOne({ bloodGroup: bloodType, status: "Active" });
  if (!existing) {
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
};

/* ===============================================================
   ADD TO INVENTORY  (donor donates)
   component defaults to "wholeBlood" — 1 whole blood unit per donation
   =============================================================== */
export const addToInventory = async ({ bloodType, units = 1, component = "wholeBlood", source = "Donor", notes = "", performedBy = "System" }) => {
  let inv = await BloodInventory.findOne({ bloodType });

  if (!inv) {
    inv = new BloodInventory({ bloodType, wholeBlood: 0, plasma: 0, platelets: 0, rbc: 0 });
  }

  inv[component] = (inv[component] || 0) + Number(units);
  inv.source     = source;
  inv.updatedAt  = new Date();
  recalcStatus(inv);
  await inv.save();

  await BloodTransaction.create({
    bloodType,
    transactionType: "IN",
    component,
    units: Number(units),
    source,
    notes,
    performedBy
  });

  if (inv.status === "Critical") await autoAlert(bloodType);

  return inv;
};

/* ===============================================================
   DEDUCT FROM INVENTORY  (blood request fulfilled)
   Tries wholeBlood first, then rbc as fallback
   =============================================================== */
export const deductFromInventory = async ({ bloodType, units, issuedTo, reason = "Transfusion", notes = "", performedBy = "Admin" }) => {
  const inv = await BloodInventory.findOne({ bloodType });

  // No inventory record at all — create one at 0 so it shows up
  if (!inv) {
    await BloodInventory.create({ bloodType, wholeBlood: 0, plasma: 0, platelets: 0, rbc: 0, status: "Critical" });
    await autoAlert(bloodType);
    return null; // caller can decide to proceed anyway
  }

  // Pick component with enough stock, prefer wholeBlood → rbc
  let component = null;
  for (const c of ["wholeBlood", "rbc", "plasma", "platelets"]) {
    if (inv[c] >= Number(units)) { component = c; break; }
  }

  // Not enough in any single component — deduct from wholeBlood anyway (can go to 0 min)
  if (!component) {
    component = "wholeBlood";
    inv[component] = Math.max(0, inv[component] - Number(units));
  } else {
    inv[component] -= Number(units);
  }

  inv.updatedAt = new Date();
  recalcStatus(inv);
  await inv.save();

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

  if (inv.status === "Critical") await autoAlert(bloodType);

  return inv;
};
