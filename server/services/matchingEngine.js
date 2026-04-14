import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";
import Notification from "../models/Notification.js";

/* ================= COMPATIBILITY MAP ================= */
// Key = donor blood group, Value = array of recipient blood groups they can donate to

export const COMPATIBILITY = {
  "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A-":  ["A-", "A+", "AB-", "AB+"],
  "A+":  ["A+", "AB+"],
  "B-":  ["B-", "B+", "AB-", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"]
};

const VALID_BLOOD_GROUPS = Object.keys(COMPATIBILITY);

/* ================= GET COMPATIBLE DONOR GROUPS ================= */
// Given a recipient blood group, returns all donor blood groups that can donate to it

export function getCompatibleDonorGroups(recipientBloodGroup) {
  if (!VALID_BLOOD_GROUPS.includes(recipientBloodGroup)) {
    throw new Error(`Invalid blood group: ${recipientBloodGroup}`);
  }

  return VALID_BLOOD_GROUPS.filter(donorGroup =>
    COMPATIBILITY[donorGroup].includes(recipientBloodGroup)
  );
}

/* ================= IS DONOR ELIGIBLE ================= */
// Returns true only when ALL three conditions hold:
// 1. availability === true
// 2. lastDonationDate is null OR more than 90 days ago
// 3. donor.user does not equal requesterUserId (admin-created donors with no user always pass)

export function isDonorEligible(donor, requesterUserId) {
  // Check availability
  if (!donor.availability) return false;

  // Check 90-day cooldown
  if (donor.lastDonationDate) {
    const daysSince = (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 90) return false;
  }

  // Self-exclusion: skip if donor is the requester (admin-created donors have no user — always pass)
  if (donor.user && requesterUserId) {
    if (donor.user.toString() === requesterUserId.toString()) return false;
  }

  return true;
}

/* ================= RUN FOR REQUEST ================= */
// Main matching function — finds eligible donors and notifies them

export async function runForRequest(requestId, io) {
  const request = await BloodRequest.findById(requestId);
  if (!request) {
    throw new Error(`BloodRequest not found: ${requestId}`);
  }

  const compatibleGroups = getCompatibleDonorGroups(request.bloodGroup);

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Query donors: same city (case-insensitive), compatible blood group, available, not in cooldown
  const candidates = await Donor.find({
    city: { $regex: new RegExp(`^${request.city}$`, "i") },
    bloodGroup: { $in: compatibleGroups },
    availability: true,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lt: ninetyDaysAgo } }
    ]
  });

  // Apply self-exclusion filter
  const eligible = candidates.filter(donor =>
    isDonorEligible(donor, request.user)
  );

  let matched = 0;

  for (const donor of eligible) {
    // Only notify donors who have a linked user account
    if (!donor.user) continue;

    const message = `Urgent: ${request.bloodGroup} blood needed at ${request.hospital}, ${request.city}. Please respond if you can donate.`;

    try {
      await Notification.create({
        user: donor.user,
        request: request._id,
        type: "donorMatch",
        message
      });

      // Emit real-time notification to donor's personal room
      if (io) {
        io.to(donor.user.toString()).emit("donorMatchNotification", {
          bloodGroup: request.bloodGroup,
          hospital: request.hospital,
          city: request.city,
          urgency: request.urgency,
          requestId: request._id
        });
      }

      matched++;
    } catch (err) {
      // Duplicate key error (code 11000) = already notified, skip silently
      if (err.code !== 11000) {
        console.error(`Notification error for donor ${donor._id}:`, err.message);
      }
    }
  }

  return { matched };
}
