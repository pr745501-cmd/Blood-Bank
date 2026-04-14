# Implementation Plan: Inventory Low-Stock Alerts

## Overview

Implement proactive low-stock alerting for BloodConnect. The work is split into five incremental phases: data model, backend alert service, API routes + controller wiring, frontend display, and integration. Each phase builds directly on the previous one.

## Tasks

- [x] 1. Create the StockThreshold Mongoose model
  - Create `server/models/StockThreshold.js` with fields: `bloodGroup` (String, required), `threshold` (Number, default 10, min 0), `alertedAt` (Date, nullable)
  - Add a unique index on `bloodGroup`
  - Export the model as default
  - _Requirements: 1.1, 1.5, 6.1_

- [x] 2. Implement the Alert Service
  - [x] 2.1 Create `server/services/alertService.js` with `checkAndNotify(bloodType, total, io)`
    - Upsert a default `StockThreshold` document if none exists for the blood group (threshold = 10)
    - If `total < threshold` and `alertedAt` is null: set `alertedAt = new Date()`, emit `lowStockAlert` via `io` with payload `{ bloodGroup, currentUnits, threshold, timestamp }`
    - If `total < threshold` and `alertedAt` is already set: skip (duplicate suppression)
    - If `total >= threshold` and `alertedAt` is set: clear `alertedAt` to null and save
    - Guard with `if (io)` before emitting; catch DB errors and log without rethrowing
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 2.2 Write property test for total units computation (Property 1)
    - **Property 1: Total units computation is the sum of all four components**
    - **Validates: Requirements 2.1**
    - Use `fc.tuple(fc.nat(), fc.nat(), fc.nat(), fc.nat())` for (wholeBlood, plasma, platelets, rbc)
    - Verify computed total equals their arithmetic sum
    - Tag: `// Feature: inventory-low-stock-alerts, Property 1: Total units computation`

  - [ ]* 2.3 Write property test for low-stock classification (Property 2)
    - **Property 2: Low-stock classification matches threshold comparison**
    - **Validates: Requirements 2.2**
    - Use `fc.tuple(fc.nat(), fc.nat())` for (total, threshold)
    - Verify classification is low-stock iff `total < threshold`
    - Tag: `// Feature: inventory-low-stock-alerts, Property 2: Low-stock classification`

  - [ ]* 2.4 Write property test for single alert per continuous low-stock period (Property 3)
    - **Property 3: Exactly one alert per continuous low-stock period**
    - **Validates: Requirements 2.3, 3.6, 6.2, 6.4**
    - Use `fc.array(fc.nat({ max: threshold - 1 }), { minLength: 1 })` for sequences all below threshold
    - Verify emit count is exactly 1 across the whole sequence
    - Tag: `// Feature: inventory-low-stock-alerts, Property 3: Single alert per period`

  - [ ]* 2.5 Write property test for alertedAt cleared on recovery (Property 4)
    - **Property 4: alertedAt is cleared on stock recovery**
    - **Validates: Requirements 2.4, 6.3**
    - Generate a low-stock state (total < threshold), then a recovery value (total >= threshold)
    - Verify `alertedAt` is null after the recovery call
    - Tag: `// Feature: inventory-low-stock-alerts, Property 4: alertedAt cleared on recovery`

  - [ ]* 2.6 Write property test for lowStockAlert payload shape (Property 8)
    - **Property 8: lowStockAlert payload contains all required fields with correct types**
    - **Validates: Requirements 3.2**
    - Generate various (bloodGroup, currentUnits, threshold) inputs
    - Verify emitted payload always has `bloodGroup` (string), `currentUnits` (number), `threshold` (number), `timestamp` (valid ISO 8601 string)
    - Tag: `// Feature: inventory-low-stock-alerts, Property 8: Payload shape`

- [ ] 3. Checkpoint — Ensure alert service unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the threshold controller and routes
  - [x] 4.1 Create `server/controllers/thresholdController.js` with `getThresholds` and `updateThreshold`
    - `getThresholds`: upsert defaults for all 8 blood groups if fewer than 8 documents exist, then return all 8
    - `updateThreshold`: validate `bloodGroup` is one of the 8 standard groups; validate `threshold` is a non-negative integer; return 400 with descriptive message on failure; persist and return updated document on success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 4.2 Write property test for GET always returning all 8 groups (Property 6)
    - **Property 6: Threshold GET always returns all 8 blood groups with valid defaults**
    - **Validates: Requirements 1.1, 1.4**
    - Vary which blood groups have saved thresholds (any subset of the 8)
    - Verify GET always returns exactly 8 entries; unconfigured ones return 10
    - Tag: `// Feature: inventory-low-stock-alerts, Property 6: GET returns all 8 groups`

  - [ ]* 4.3 Write property test for threshold validation rejecting invalid values (Property 5)
    - **Property 5: Threshold validation rejects all non-non-negative-integer values**
    - **Validates: Requirements 1.3**
    - Use `fc.oneof(fc.double({ noNaN: true, noDefaultInfinity: true }).filter(n => !Number.isInteger(n) || n < 0), fc.string())`
    - Verify all rejected with 400 and stored threshold unchanged
    - Tag: `// Feature: inventory-low-stock-alerts, Property 5: Threshold validation`

  - [x] 4.4 Add threshold routes to `server/routes/bloodRoutes.js`
    - Import `getThresholds` and `updateThreshold` from `thresholdController.js`
    - Add `GET /thresholds` → `getThresholds` (protected: `verifyToken, isAdmin`)
    - Add `PATCH /thresholds/:bloodGroup` → `updateThreshold` (protected: `verifyToken, isAdmin`)
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 5. Wire checkAndNotify into bloodController.js
  - Import `checkAndNotify` from `../services/alertService.js` in `bloodController.js`
  - In `addStock`: after `await inventory.save()`, call `await checkAndNotify(bloodType, total, req.app.get("io"))`
  - In `dispenseStock`: after `await inventory.save()`, call `await checkAndNotify(bloodType, recalcStatus(inventory), req.app.get("io"))` — note: `recalcStatus` already returns the total, capture it
  - _Requirements: 2.1, 2.5, 3.1, 3.6_

- [ ] 6. Checkpoint — Ensure backend integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update NotificationContext to handle lowStockAlert events
  - In `client/src/context/NotificationContext.jsx`, add a `lowStockAlert` socket listener inside the existing `useEffect`
  - Validate the payload has `bloodGroup`, `currentUnits`, `threshold`, and `timestamp` before calling `add()`; silently drop malformed events
  - Call `add()` with `{ type: "low_stock", title: "⚠️ Low Stock Alert", body: \`${bloodGroup} is low — ${currentUnits} units remaining (threshold: ${threshold})\`, link: "/admin/blood-inventory" }`
  - If `Notification.permission === "granted"`, fire a browser push notification with the blood group and unit count
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 8. Add LowStockBadge component and integrate into AdminBloodInventory
  - [x] 8.1 Create a `LowStockBadge` inline component (or small function) in `AdminBloodInventory.jsx`
    - Renders a warning icon (`AlertTriangle`) + unit count in amber/red styling
    - Accepts `units` prop
    - _Requirements: 4.2_

  - [x] 8.2 Fetch thresholds on mount in `AdminBloodInventory.jsx`
    - Add `thresholds` state (object keyed by bloodGroup)
    - On mount (alongside existing `fetchInventory`), call `GET /api/blood/thresholds` and populate state; on error, fall back to default of 10 for all groups
    - Re-fetch thresholds when inventory is refreshed
    - _Requirements: 4.4, 4.5_

  - [x] 8.3 Render LowStockBadge on low-stock inventory cards
    - Compute `isLowStock(item)` = `(item.wholeBlood + item.plasma + item.platelets + item.rbc) < (thresholds[item.bloodType] ?? 10)`
    - Render `<LowStockBadge units={total} />` on cards where `isLowStock` is true; render nothing otherwise
    - _Requirements: 4.1, 4.3_

  - [ ]* 8.4 Write property test for badge visibility (Property 7)
    - **Property 7: Low-stock badge visibility matches threshold comparison**
    - **Validates: Requirements 4.1, 4.3**
    - Use `fc.tuple(fc.nat(), fc.nat())` for (units, threshold)
    - Render the badge logic; verify badge present iff `units < threshold`
    - Tag: `// Feature: inventory-low-stock-alerts, Property 7: Badge visibility`

- [x] 9. Add CriticalBanner component and integrate into AdminDashboard
  - [x] 9.1 Create a `CriticalBanner` inline component in `AdminDashboard.jsx`
    - Accepts `groups` prop (array of `{ bloodGroup, currentUnits }`)
    - Renders a dismissible red/amber banner listing each group name and unit count
    - Includes a link to `/admin/blood-inventory`
    - _Requirements: 5.2, 5.5_

  - [x] 9.2 Fetch inventory and thresholds on mount in `AdminDashboard.jsx`
    - Add `inventory` and `thresholds` state
    - On mount (alongside existing stats fetch), call `GET /api/blood/inventory` and `GET /api/blood/thresholds`; on error, fall back gracefully
    - Derive `lowStockGroups` = inventory items where total < threshold
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 9.3 Render CriticalBanner when lowStockGroups is non-empty
    - Render `<CriticalBanner groups={lowStockGroups} />` above the stat cards when `lowStockGroups.length > 0`
    - Render nothing when `lowStockGroups.length === 0`
    - _Requirements: 5.1, 5.3_

  - [ ]* 9.4 Write property test for CriticalBanner render logic (Property 9)
    - **Property 9: CriticalBanner renders iff low-stock groups exist and lists all of them**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Use `fc.array(fc.record({ bloodGroup: fc.constantFrom("A+","A-","B+","B-","O+","O-","AB+","AB-"), total: fc.nat(), threshold: fc.nat() }))`
    - Render the banner logic; verify banner present iff any `total < threshold`, and banner lists exactly those groups
    - Tag: `// Feature: inventory-low-stock-alerts, Property 9: CriticalBanner render logic`

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests require `fast-check` — install with `npm install --save-dev fast-check` in `server/`
- Each property test runs a minimum of 100 iterations
- The `checkAndNotify` call is best-effort: DB errors are logged but never rethrow to avoid breaking stock operations
- Frontend threshold fetch falls back to default 10 on error — no hard failure
- All threshold routes require `verifyToken` + `isAdmin` middleware (same pattern as existing admin routes)
