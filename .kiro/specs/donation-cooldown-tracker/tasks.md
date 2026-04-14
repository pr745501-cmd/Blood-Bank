# Implementation Plan: Donation Cooldown Tracker

## Overview

Implement the 90-day donation cooldown tracker across the BloodConnect stack. The work proceeds in five phases: (1) backend pure service + Donor model update, (2) cooldown REST endpoint + dashboard route fix, (3) eligibility scheduler + availability toggle, (4) frontend CooldownWidget + NotificationContext listener, and (5) admin donor list enhancements. Each phase wires into the previous one so there is no orphaned code.

## Tasks

- [x] 1. Add `eligibilityNotifiedAt` field to Donor model and create `cooldownService.js`
  - Add `eligibilityNotifiedAt: { type: Date, default: null }` to `server/models/Donor.js`
  - Create `server/services/cooldownService.js` with two pure, side-effect-free exports:
    - `computeCooldownStatus(lastDonationDate)` → `{ isEligible, daysRemaining, elapsedDays, nextEligibleDate }` using UTC day arithmetic and `COOLDOWN_DAYS = 90`
    - `shouldNotify(status, eligibilityNotifiedAt, lastDonationDate)` → boolean
  - Handle the null `lastDonationDate` case (return `isEligible: true, daysRemaining: 0`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2_

  - [ ]* 1.1 Write property tests for `computeCooldownStatus` (in-cooldown range)
    - **Property 1: In-cooldown status is correct for all dates within the window**
    - **Validates: Requirements 1.1, 1.3**
    - Use fast-check `fc.integer({ min: 1, max: 89 })` for elapsed days
    - File: `server/tests/cooldownService.property.test.js`

  - [ ]* 1.2 Write property tests for `computeCooldownStatus` (eligible range)
    - **Property 2: Eligible status is correct for all dates at or beyond the window**
    - **Validates: Requirements 1.2, 1.4**
    - Use fast-check `fc.integer({ min: 90, max: 365 })` for elapsed days
    - File: `server/tests/cooldownService.property.test.js`

  - [ ]* 1.3 Write unit tests for `cooldownService.js` edge cases
    - Test null `lastDonationDate` → `isEligible: true` (Requirement 1.5)
    - Test exact 90-day boundary → `isEligible: true, daysRemaining: 0`
    - Test `shouldNotify` returns false when `eligibilityNotifiedAt` is after `lastDonationDate`
    - File: `server/tests/cooldownService.test.js`

- [x] 2. Create `GET /api/cooldown/status/:userId` endpoint and fix dashboard route
  - Create `server/routes/cooldownRoutes.js`:
    - `GET /api/cooldown/status/:userId` — find donor by `user` field, call `computeCooldownStatus`, return `{ isEligible, daysRemaining, nextEligibleDate, lastDonationDate }`
    - Return 404 if donor not found; 400 for invalid ObjectId
  - Update `server/routes/dashboardRoutes.js` `/stats/:userId`:
    - Import and use `computeCooldownStatus` from `cooldownService.js`
    - Replace the hardcoded 42-day `recoveryPercentage` / `nextEligibleDate` logic with the service's output
  - Register `cooldownRoutes` in `server/server.js` as `/api/cooldown`
  - _Requirements: 1.6, 2.3_

  - [ ]* 2.1 Write integration tests for `GET /api/cooldown/status/:userId`
    - Use Supertest + mongodb-memory-server; seed three donor scenarios: no donation, in cooldown, eligible
    - Verify response shape `{ isEligible, daysRemaining, nextEligibleDate, lastDonationDate }`
    - File: `server/tests/cooldownRoutes.integration.test.js`

- [x] 3. Update donation recording to reset cooldown state
  - In `server/routes/donorRoutes.js` `POST /donate`:
    - After saving the donor, set `donor.eligibilityNotifiedAt = null`
    - Set `User.availability = false` for the linked user (if exists); log a warning if user not found
    - Update the eligibility check from 42 days to 90 days (use `COOLDOWN_DAYS` from `cooldownService`)
  - In `server/routes/donorRoutes.js` `PATCH /approve/:id`:
    - Same resets: `eligibilityNotifiedAt = null`, `User.availability = false`
  - _Requirements: 3.1, 3.4, 3.5, 6.3_

  - [ ]* 3.1 Write property tests for donation recording availability toggle
    - **Property 4: Recording a donation always sets both availability fields to false**
    - **Validates: Requirements 3.1, 3.4**
    - Use fast-check to generate donor documents with and without a linked User
    - File: `server/tests/donorDonation.property.test.js`

  - [ ]* 3.2 Write property tests for `eligibilityNotifiedAt` reset on new donation
    - **Property 10: `eligibilityNotifiedAt` is reset to null on new donation**
    - **Validates: Requirements 6.3**
    - File: `server/tests/donorDonation.property.test.js`

- [ ] 4. Checkpoint — Ensure all server-side tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create `eligibilityScheduler.js` cron job
  - Create `server/jobs/eligibilityScheduler.js`:
    - Install / import `node-cron`; schedule with expression `"0 0 * * *"` (midnight UTC)
    - Export `runEligibilityCheck(io)` async function:
      - Query all `Donor` documents
      - For each donor, call `computeCooldownStatus` and `shouldNotify`
      - If eligible and should notify: set `Donor.availability = true`, set `User.availability = true` (warn if no linked user), set `eligibilityNotifiedAt = new Date()`, emit `donorEligible` via `io` with `{ userId, donorName }`
      - Wrap each donor in try/catch — log error and continue on failure
  - Wire the scheduler into `server/server.js` after the DB connection resolves, passing `io`
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.1, 4.3, 6.2, 6.4_

  - [ ]* 5.1 Write property tests for scheduler availability update
    - **Property 5: Scheduler sets availability to true for all expired-cooldown donors**
    - **Validates: Requirements 3.2, 3.4**
    - Mock DB and Socket.IO; use fast-check to generate lists of donors with `lastDonationDate` ≥ 90 days ago
    - File: `server/tests/eligibilityScheduler.property.test.js`

  - [ ]* 5.2 Write property tests for notification idempotency
    - **Property 6: No duplicate eligibility notifications**
    - **Validates: Requirements 4.3, 6.2**
    - Verify `donorEligible` is NOT emitted when `eligibilityNotifiedAt` is already set after `lastDonationDate`
    - File: `server/tests/eligibilityScheduler.property.test.js`

  - [ ]* 5.3 Write property tests for scheduler error isolation
    - **Property 11: One failing donor does not halt others**
    - **Validates: Requirements 6.4**
    - Inject a donor that throws on DB save; verify remaining donors are still processed
    - File: `server/tests/eligibilityScheduler.property.test.js`

  - [ ]* 5.4 Write unit tests for scheduler
    - Verify cron expression string equals `"0 0 * * *"` (smoke test, Requirement 3.3)
    - Verify no `donorEligible` emission when `eligibilityNotifiedAt` is already set
    - File: `server/tests/eligibilityScheduler.test.js`

  - [ ]* 5.5 Write integration test for scheduler Socket.IO emission
    - Seed eligible donors, run `runEligibilityCheck`, verify `donorEligible` emitted
    - File: `server/tests/eligibilityScheduler.integration.test.js`

- [x] 6. Enhance `GET /api/admin/donors` with cooldown fields
  - In `server/routes/adminRoutes.js`, update the `GET /donors` handler:
    - Import `computeCooldownStatus` from `cooldownService.js`
    - Map each donor to add `isEligible` and `daysRemaining` computed fields before sending the response
  - _Requirements: 5.6_

  - [ ]* 6.1 Write integration test for admin donors cooldown fields
    - Verify `isEligible` and `daysRemaining` are present in the response for each donor
    - File: `server/tests/adminDonors.integration.test.js`

- [ ] 7. Checkpoint — Ensure all server-side tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create `CooldownWidget.jsx` React component
  - Create `client/src/components/dashboard/CooldownWidget.jsx`
  - Accept props: `{ isEligible, daysRemaining, nextEligibleDate, lastDonationDate, loading }`
  - Render three states:
    - `loading` → skeleton placeholder (grey animated bars)
    - `isEligible = true` (or no `lastDonationDate`) → green "You are eligible to donate!" card
    - `isEligible = false` → red/amber card with `daysRemaining` countdown, `nextEligibleDate`, and a circular SVG progress arc showing `Math.round((90 - daysRemaining) / 90 * 100)%` elapsed
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 8.1 Write property tests for progress percentage rendering
    - **Property 3: Progress percentage is consistent with daysRemaining**
    - **Validates: Requirements 2.3**
    - Use fast-check `fc.integer({ min: 0, max: 90 })` for `daysRemaining`; assert rendered percentage equals `Math.round((90 - daysRemaining) / 90 * 100)`
    - File: `client/src/tests/CooldownWidget.property.test.jsx`

  - [ ]* 8.2 Write unit tests for `CooldownWidget`
    - Test loading skeleton renders when `loading = true`
    - Test eligible state renders green indicator
    - Test in-cooldown state renders `daysRemaining` and `nextEligibleDate`
    - Test null `lastDonationDate` renders eligible state
    - File: `client/src/tests/CooldownWidget.test.jsx`

- [x] 9. Integrate `CooldownWidget` into `DonorStatsSection`
  - In `client/src/components/dashboard/DonorStatsSection.jsx`:
    - Add a `useEffect` to call `GET /api/cooldown/status/:userId` using the stored user ID
    - Track `cooldownData` and `cooldownLoading` state
    - Render `<CooldownWidget>` below the existing eligibility card, passing the fetched data and loading state
    - Replace the hardcoded 42-day `recoveryPercentage` / `nextEligibleDate` display with values from `cooldownData` (the dashboard `/stats` endpoint already returns corrected values after Task 2)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 10. Add `donorEligible` socket listener to `NotificationContext`
  - In `client/src/context/NotificationContext.jsx`, inside the existing `useEffect` socket setup:
    - Add `socket.on("donorEligible", (payload) => { ... })` listener
    - Call `add({ type: "eligibility", title: "🩸 You're Eligible to Donate!", body: "Your 90-day cooldown is complete. Schedule your next donation today.", link: "/dashboard" })`
    - If `Notification.permission === "granted"`, fire a browser `new Notification(...)` with the same title
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [ ]* 10.1 Write property tests for notification schema conformance
    - **Property 7: Notification object contains all required fields**
    - **Validates: Requirements 4.4**
    - Use fast-check to generate arbitrary `donorEligible` payloads; assert added notification has `id`, `read`, `ts`, `type`, `title`, `body`
    - File: `client/src/tests/NotificationContext.property.test.jsx`

  - [ ]* 10.2 Write unit tests for `donorEligible` handler
    - Test that `donorEligible` event adds a notification with correct title and body
    - Test that browser `Notification` is called when permission is `"granted"`
    - File: `client/src/tests/NotificationContext.test.jsx`

- [x] 11. Add cooldown status column and filter to `AdminDonors`
  - In `client/src/admin/AdminDonors.jsx`:
    - Add a "Cooldown Status" column to the table header and each donor row
    - Render a green "Eligible" badge when `donor.isEligible === true`
    - Render a red/amber "In Cooldown (N days)" badge when `donor.isEligible === false`
    - Add a filter control (dropdown or tab group) with options "All" | "Eligible" | "In Cooldown"
    - Implement client-side filtering: derive `filteredDonors` from `donors` state based on selected filter; paginate over `filteredDonors`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 11.1 Write property tests for admin status badge rendering
    - **Property 8: Status badge text matches cooldown state**
    - **Validates: Requirements 5.1**
    - Use fast-check to generate donor records with arbitrary `lastDonationDate`; assert badge text is exactly "Eligible" or matches "In Cooldown (N days)"
    - File: `client/src/tests/AdminDonors.property.test.jsx`

  - [ ]* 11.2 Write property tests for admin status filter
    - **Property 9: Status filter returns only matching donors**
    - **Validates: Requirements 5.4, 5.5**
    - Use fast-check to generate mixed-eligibility donor lists; assert "Eligible" filter returns only `isEligible: true` donors and "In Cooldown" filter returns only `isEligible: false` donors
    - File: `client/src/tests/AdminDonors.property.test.jsx`

  - [ ]* 11.3 Write unit tests for `AdminDonors` cooldown UI
    - Test green badge renders for eligible donor
    - Test red/amber badge with day count renders for in-cooldown donor
    - Test filter controls are present in the DOM
    - File: `client/src/tests/AdminDonors.test.jsx`

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- `COOLDOWN_DAYS = 90` is defined once in `cooldownService.js` — update there if medical guidelines change
- Property tests use **fast-check** (compatible with Vitest already used in the project)
- The scheduler is wired after the MongoDB connection resolves in `server.js` to avoid race conditions
- `eligibilityNotifiedAt` guards against duplicate notifications across scheduler runs (idempotency)
