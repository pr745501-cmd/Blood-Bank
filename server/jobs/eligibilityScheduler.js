import cron from "node-cron";
import Donor from "../models/Donor.js";
import User from "../models/User.js";
import { computeCooldownStatus, shouldNotify } from "../services/cooldownService.js";

export const CRON_EXPRESSION = "0 0 * * *"; // midnight UTC daily

/**
 * Runs the eligibility check for all donors.
 * - Sets availability = true for donors whose cooldown has expired
 * - Emits donorEligible Socket.IO event (once per eligibility cycle)
 * - Errors per-donor are caught and logged; processing continues
 */
export async function runEligibilityCheck(io) {
  const donors = await Donor.find({});

  for (const donor of donors) {
    try {
      const status = computeCooldownStatus(donor.lastDonationDate);

      if (status.isEligible) {
        // Update availability to true if it was false
        if (!donor.availability) {
          donor.availability = true;
          await donor.save();

          // Also update linked User
          if (donor.user) {
            await User.findByIdAndUpdate(donor.user, { availability: true }).catch(err =>
              console.warn(`Could not update User availability for donor ${donor._id}:`, err.message)
            );
          }
        }

        // Send notification if not already sent for this cycle
        if (shouldNotify(status, donor.eligibilityNotifiedAt, donor.lastDonationDate)) {
          donor.eligibilityNotifiedAt = new Date();
          await donor.save();

          if (io && donor.user) {
            io.to(donor.user.toString()).emit("donorEligible", {
              userId: donor.user.toString(),
              donorName: donor.name
            });
          }
        }
      }
    } catch (err) {
      console.error(`Eligibility check error for donor ${donor._id}:`, err.message);
      // Continue processing remaining donors
    }
  }
}

/**
 * Starts the daily eligibility cron job.
 * Call this after the DB connection is established.
 */
export function startEligibilityScheduler(io) {
  cron.schedule(CRON_EXPRESSION, () => {
    runEligibilityCheck(io).catch(err =>
      console.error("Eligibility scheduler error:", err.message)
    );
  }, { timezone: "UTC" });

}
