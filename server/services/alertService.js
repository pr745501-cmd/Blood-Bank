import StockThreshold from "../models/StockThreshold.js";

const DEFAULT_THRESHOLD = 10;

/**
 * Checks if a blood group is below its configured threshold and emits a
 * lowStockAlert Socket.IO event if this is a new low-stock event.
 * Errors are caught and logged — never rethrown (stock operation must not fail).
 *
 * @param {string} bloodType - e.g. "A+", "O-"
 * @param {number} total - current total units across all components
 * @param {object|null} io - Socket.IO server instance
 */
export async function checkAndNotify(bloodType, total, io) {
  try {
    // Upsert default threshold document if it doesn't exist
    let record = await StockThreshold.findOne({ bloodGroup: bloodType });
    if (!record) {
      record = await StockThreshold.create({
        bloodGroup: bloodType,
        threshold: DEFAULT_THRESHOLD,
        alertedAt: null
      });
    }

    const { threshold } = record;

    if (total < threshold) {
      // Already alerted for this low-stock period — skip
      if (record.alertedAt) return;

      // New low-stock event — set alertedAt and emit
      record.alertedAt = new Date();
      await record.save();

      if (io) {
        io.emit("lowStockAlert", {
          bloodGroup: bloodType,
          currentUnits: total,
          threshold,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Stock recovered — clear alertedAt so future drops trigger a new alert
      if (record.alertedAt) {
        record.alertedAt = null;
        await record.save();
      }
    }
  } catch (err) {
    console.error(`alertService.checkAndNotify error for ${bloodType}:`, err.message);
    // Never rethrow — stock operation must succeed regardless
  }
}
