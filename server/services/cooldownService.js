/* ================= COOLDOWN SERVICE ================= */
// Pure functions — no DB access, no side effects

export const COOLDOWN_DAYS = 90;

/**
 * Computes the cooldown status for a donor.
 * @param {Date|null} lastDonationDate
 * @returns {{ isEligible: boolean, daysRemaining: number, elapsedDays: number, nextEligibleDate: Date|null }}
 */
export function computeCooldownStatus(lastDonationDate) {
  if (!lastDonationDate) {
    return {
      isEligible: true,
      daysRemaining: 0,
      elapsedDays: 0,
      nextEligibleDate: null
    };
  }

  const now = Date.now();
  const last = new Date(lastDonationDate).getTime();
  const elapsedDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (elapsedDays >= COOLDOWN_DAYS) {
    return {
      isEligible: true,
      daysRemaining: 0,
      elapsedDays,
      nextEligibleDate: null
    };
  }

  const daysRemaining = COOLDOWN_DAYS - elapsedDays;
  const nextEligibleDate = new Date(last + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  return {
    isEligible: false,
    daysRemaining,
    elapsedDays,
    nextEligibleDate
  };
}

/**
 * Determines whether the eligibility notification should be sent.
 * Returns true only if the donor is eligible AND hasn't been notified since their last donation.
 * @param {{ isEligible: boolean }} status
 * @param {Date|null} eligibilityNotifiedAt
 * @param {Date|null} lastDonationDate
 * @returns {boolean}
 */
export function shouldNotify(status, eligibilityNotifiedAt, lastDonationDate) {
  if (!status.isEligible) return false;

  // If never notified, always notify
  if (!eligibilityNotifiedAt) return true;

  // If notified after the last donation, skip (already sent for this cycle)
  if (lastDonationDate && new Date(eligibilityNotifiedAt) > new Date(lastDonationDate)) {
    return false;
  }

  return true;
}
