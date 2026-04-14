# Requirements Document

## Introduction

The Donation Cooldown Tracker is a feature for BloodConnect that enforces the 90-day whole-blood donation cooldown rule. It provides donors with a real-time countdown on their dashboard showing how many days remain until they are eligible to donate again, automatically manages donor availability status based on cooldown state, sends an in-app notification the moment a donor crosses the 90-day threshold and becomes eligible, and gives admins a filtered view of the donor list showing cooldown vs. eligible status.

## Glossary

- **Cooldown_Service**: The backend service responsible for computing cooldown state, eligibility dates, and triggering availability updates.
- **Notification_Service**: The existing Socket.IO-based notification system in `NotificationContext.jsx` that delivers in-app notifications to donors.
- **Eligibility_Scheduler**: A server-side scheduled job (cron) that runs daily to evaluate donor cooldown states and emit eligibility notifications.
- **Donor**: A registered user with a linked `Donor` document containing `lastDonationDate`, `donationCount`, and `availability` fields.
- **Cooldown_Period**: The mandatory 90-day waiting period after a whole-blood donation before a donor may donate again.
- **Cooldown_Widget**: The UI component rendered inside `DonorStatsSection` on the donor dashboard that displays cooldown status and countdown.
- **Admin_Donor_List**: The `AdminDonors` page that lists all registered donors with their profile data.
- **Availability**: The boolean field (`availability`) on both the `Donor` and `User` models indicating whether a donor is currently eligible to donate.

---

## Requirements

### Requirement 1: Cooldown Status Computation

**User Story:** As a donor, I want the system to know exactly how many days remain in my cooldown period, so that I always see accurate eligibility information.

#### Acceptance Criteria

1. WHEN a donor's `lastDonationDate` is set, THE Cooldown_Service SHALL compute the number of days elapsed since that date using UTC dates.
2. THE Cooldown_Service SHALL define the Cooldown_Period as exactly 90 calendar days from `lastDonationDate`.
3. WHEN the elapsed days are less than 90, THE Cooldown_Service SHALL return a `daysRemaining` value equal to `90 - elapsedDays`.
4. WHEN the elapsed days are greater than or equal to 90, THE Cooldown_Service SHALL return a `daysRemaining` value of 0 and an `isEligible` flag of `true`.
5. WHEN a donor has no `lastDonationDate`, THE Cooldown_Service SHALL return `isEligible` as `true` and `daysRemaining` as 0.
6. THE Cooldown_Service SHALL expose a `GET /api/cooldown/status/:userId` endpoint that returns `{ isEligible, daysRemaining, nextEligibleDate, lastDonationDate }`.

---

### Requirement 2: Donor Dashboard Cooldown Widget

**User Story:** As a donor, I want to see my cooldown status clearly on my dashboard, so that I know at a glance whether I can donate today or how many days I must wait.

#### Acceptance Criteria

1. WHEN a donor views the dashboard and `isEligible` is `false`, THE Cooldown_Widget SHALL display the `daysRemaining` count and the `nextEligibleDate` in a visually distinct "In Cooldown" state.
2. WHEN a donor views the dashboard and `isEligible` is `true`, THE Cooldown_Widget SHALL display a "You are eligible to donate!" status with a distinct visual indicator (green color scheme).
3. WHEN a donor views the dashboard and `isEligible` is `false`, THE Cooldown_Widget SHALL display a progress indicator showing the percentage of the 90-day Cooldown_Period that has elapsed.
4. WHEN a donor has no `lastDonationDate`, THE Cooldown_Widget SHALL display the "You are eligible to donate!" status.
5. THE Cooldown_Widget SHALL be rendered within the existing `DonorStatsSection` component on the donor dashboard.
6. WHEN the cooldown data is loading, THE Cooldown_Widget SHALL display a loading skeleton in place of the cooldown content.

---

### Requirement 3: Automatic Availability Toggle

**User Story:** As a system administrator, I want donor availability to be automatically managed based on cooldown state, so that the donor list always reflects accurate real-time eligibility without manual intervention.

#### Acceptance Criteria

1. WHEN a donation is recorded for a donor, THE Cooldown_Service SHALL set the donor's `Donor.availability` to `false` and `User.availability` to `false` within the same database transaction.
2. WHEN the Eligibility_Scheduler runs and a donor's `daysRemaining` transitions from greater than 0 to 0, THE Cooldown_Service SHALL set `Donor.availability` to `true` and `User.availability` to `true`.
3. THE Eligibility_Scheduler SHALL run once every 24 hours at midnight UTC.
4. WHEN `Donor.availability` is updated by the Cooldown_Service, THE Cooldown_Service SHALL also update the linked `User.availability` field to the same value, provided a linked `User` document exists.
5. IF the linked `User` document does not exist for a `Donor`, THEN THE Cooldown_Service SHALL update only `Donor.availability` and log a warning.

---

### Requirement 4: Eligibility In-App Notification

**User Story:** As a donor, I want to receive an in-app notification on the day I become eligible to donate again, so that I am reminded to schedule my next donation without having to check manually.

#### Acceptance Criteria

1. WHEN the Eligibility_Scheduler detects that a donor's `daysRemaining` has transitioned to 0 on the current run, THE Notification_Service SHALL emit a `donorEligible` Socket.IO event to the donor's connected client.
2. WHEN a `donorEligible` event is received by the client, THE Notification_Service SHALL add a notification with title "🩸 You're Eligible to Donate!" and a body indicating the donor may now schedule a donation.
3. THE Notification_Service SHALL deliver the `donorEligible` notification only once per eligibility transition — it SHALL NOT re-emit the event on subsequent scheduler runs if the donor remains eligible and has not donated again.
4. WHEN the `donorEligible` notification is added, THE Notification_Service SHALL store it in the existing `bc_notifications` localStorage store following the existing notification schema.
5. WHERE browser notification permission has been granted, THE Notification_Service SHALL also display a browser push notification for the `donorEligible` event.

---

### Requirement 5: Admin Donor List — Cooldown Status Column

**User Story:** As an admin, I want to see which donors are currently in cooldown and which are eligible directly in the donor list, so that I can quickly assess blood supply availability.

#### Acceptance Criteria

1. THE Admin_Donor_List SHALL display a "Status" column for each donor showing either "Eligible" or "In Cooldown (N days)" where N is the `daysRemaining` value.
2. WHEN a donor's `isEligible` is `true`, THE Admin_Donor_List SHALL render the status badge with a green color scheme.
3. WHEN a donor's `isEligible` is `false`, THE Admin_Donor_List SHALL render the status badge with a red/amber color scheme and include the `daysRemaining` count.
4. THE Admin_Donor_List SHALL provide a filter control allowing the admin to filter donors by status: "All", "Eligible", or "In Cooldown".
5. WHEN the admin applies a status filter, THE Admin_Donor_List SHALL display only the donors matching the selected status without a full page reload.
6. THE Admin_Donor_List SHALL compute cooldown status on the server side and include `isEligible` and `daysRemaining` fields in the `GET /api/admin/donors` response.

---

### Requirement 6: Cooldown State Persistence and Idempotency

**User Story:** As a system operator, I want the cooldown state to be reliably persisted and the scheduler to be safe to run multiple times, so that no donor receives duplicate notifications or incorrect availability states.

#### Acceptance Criteria

1. THE Cooldown_Service SHALL store a `eligibilityNotifiedAt` date field on the `Donor` document to record when the eligibility notification was last sent.
2. WHEN the Eligibility_Scheduler runs, THE Cooldown_Service SHALL only emit a `donorEligible` notification for donors where `isEligible` is `true` AND `eligibilityNotifiedAt` is either null or predates the current `lastDonationDate`.
3. WHEN a new donation is recorded for a donor, THE Cooldown_Service SHALL reset `eligibilityNotifiedAt` to `null` so the donor will receive a notification after the next Cooldown_Period.
4. IF the Eligibility_Scheduler encounters a database error for a specific donor, THEN THE Cooldown_Service SHALL log the error and continue processing the remaining donors without halting the entire job.
