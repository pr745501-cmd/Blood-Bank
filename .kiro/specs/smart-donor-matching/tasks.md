# Implementation Plan: Smart Donor Matching

## Overview

Implement the Smart Donor Matching feature by adding a server-side matching engine, a Notification model and routes, wiring the engine into request creation and an admin trigger endpoint, and extending the frontend NotificationContext to handle donor match events.

## Tasks

- [x] 1. Create the Notification model
  - Create `server/models/Notification.js` with fields: `user` (ObjectId ref User, indexed), `request` (ObjectId ref BloodRequest), `type` (enum `["donorMatch"]`), `message` (String), `read` (Boolean, default false), and timestamps
  - Add a compound unique index `{ user: 1, request: 1 }` to prevent duplicate notifications
  - _Requirements: 3.1, 4.3_

- [x] 2. Implement the matching engine service
  - [x] 2.1 Create `server/services/matchingEngine.js` with the `COMPATIBILITY` map constant
    - Define the 8-entry donor-to-recipient compatibility map as specified in the design
    - _Requirements: 2.1_

  - [x] 2.2 Implement `getCompatibleDonorGroups(recipientBloodGroup)`
    - Invert the compatibility map to return all donor blood groups compatible with the given recipient group
    - Throw `Error("Invalid blood group: <value>")` for any input not in the map
    - _Requirements: 2.2, 2.3_

  - [ ]* 2.3 Write property test for `getCompatibleDonorGroups` — Property 1: compatibility map inversion correctness
    - **Property 1: Compatibility map inversion correctness**
    - **Validates: Requirements 2.1, 2.2**
    - Generate random `(donorGroup, recipientGroup)` pairs from the 8 valid blood groups; assert `getCompatibleDonorGroups(R).includes(D) === COMPATIBILITY[D].includes(R)`
    - `// Feature: smart-donor-matching, Property 1: compatibility map inversion correctness`

  - [ ]* 2.4 Write property test for `getCompatibleDonorGroups` — Property 2: invalid blood group yields error
    - **Property 2: Invalid blood group yields error**
    - **Validates: Requirements 2.3**
    - Generate arbitrary strings not in the valid blood group set; assert `getCompatibleDonorGroups` throws for each
    - `// Feature: smart-donor-matching, Property 2: invalid blood group yields error`

  - [x] 2.5 Implement `isDonorEligible(donor, requesterUserId)`
    - Return `true` only when all three conditions hold: `availability === true`, `lastDonationDate` is null or more than 90 days before now, and `donor.user` does not equal `requesterUserId`
    - Admin-created donors (no `user` field) pass the self-exclusion check
    - _Requirements: 1.3, 1.4, 1.5, 5.1, 5.2_

  - [ ]* 2.6 Write property test for `isDonorEligible` — Property 3: eligible donor filter correctness
    - **Property 3: Eligible donor filter correctness**
    - **Validates: Requirements 1.3, 1.4, 1.5, 5.1, 5.2**
    - Generate random donor objects with varying `availability`, `lastDonationDate` offsets, and `user` fields; assert return value matches the conjunction of all three conditions
    - `// Feature: smart-donor-matching, Property 3: eligible donor filter correctness`

  - [ ]* 2.7 Write property test for self-exclusion — Property 4: self-exclusion end-to-end invariant
    - **Property 4: Self-exclusion end-to-end invariant**
    - **Validates: Requirements 1.5, 5.1, 5.3**
    - Generate a donor pool including the requester; run eligibility filter; assert no result has `user === requesterId`
    - `// Feature: smart-donor-matching, Property 4: self-exclusion end-to-end invariant`

  - [x] 2.8 Implement `runForRequest(requestId, io)`
    - Load the BloodRequest by ID; call `getCompatibleDonorGroups` on its `bloodGroup`
    - Query Donors with matching city (case-insensitive regex), compatible blood groups, `availability: true`, and `lastDonationDate` null or > 90 days ago
    - Filter results through `isDonorEligible` to apply self-exclusion
    - For each eligible donor: upsert a Notification_Record (skip on duplicate key error), then emit `donorMatchNotification` to `io.to(donor.user.toString())`
    - Return `{ matched: N }`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 4.2, 4.3_

  - [ ]* 2.9 Write property test for no duplicate notifications — Property 5: idempotence
    - **Property 5: No duplicate notifications (idempotence)**
    - **Validates: Requirements 4.3**
    - Use `mongodb-memory-server`; call `runForRequest` twice for the same request; assert exactly one Notification_Record per eligible donor
    - `// Feature: smart-donor-matching, Property 5: no duplicate notifications (idempotence)`

  - [ ]* 2.10 Write property test for notification record completeness — Property 6
    - **Property 6: Notification record completeness**
    - **Validates: Requirements 3.1**
    - After `runForRequest`, fetch all created records; assert each has non-null `user`, `request`, `type === "donorMatch"`, `message`, and `read === false`
    - `// Feature: smart-donor-matching, Property 6: notification record completeness`

- [ ] 3. Checkpoint — Ensure all matching engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create notification API routes
  - Create `server/routes/notificationRoutes.js` with three endpoints:
    - `GET /api/notifications` — return all Notification_Records for `req.user.id`, sorted by `createdAt` descending, protected by `verifyToken`
    - `GET /api/notifications/unread-count` — return `{ count: N }` for unread records of `req.user.id`, protected by `verifyToken`
    - `PATCH /api/notifications/:id/read` — set `read: true` on the specified record (only if it belongs to `req.user.id`), protected by `verifyToken`
  - _Requirements: 3.4, 3.5, 3.6_

  - [ ]* 4.1 Write property test for notifications returned in descending order — Property 7
    - **Property 7: Notifications returned in descending order**
    - **Validates: Requirements 3.4**
    - Generate random sets of Notification_Records with varying `createdAt` timestamps; assert GET endpoint returns them newest-first
    - `// Feature: smart-donor-matching, Property 7: notifications returned in descending order`

  - [ ]* 4.2 Write property test for unread count accuracy — Property 8
    - **Property 8: Unread count accuracy**
    - **Validates: Requirements 3.6**
    - Generate random sets of notifications with varying `read` statuses; assert unread-count endpoint returns exactly the count of records where `read === false`
    - `// Feature: smart-donor-matching, Property 8: unread count accuracy`

- [x] 5. Register routes and update Socket.IO in `server.js`
  - Import and mount `notificationRoutes` at `/api/notifications` in `server/server.js`
  - Add `socket.on("joinRoom", (userId) => { if (userId) socket.join(userId); })` inside the existing `io.on("connection")` handler
  - _Requirements: 1.7, 3.2, 3.3_

- [x] 6. Wire matching engine into request creation
  - In `server/routes/requestRoutes.js`, import `matchingEngine` and after `await request.save()` add the async call: `matchingEngine.runForRequest(request._id, io).catch(console.error)`
  - _Requirements: 1.1, 1.6, 1.7, 1.8_

- [x] 7. Add admin manual trigger endpoint
  - In `server/routes/adminRoutes.js`, add `POST /match/:requestId` protected by `verifyToken` and `isAdmin`
  - Return 404 with descriptive message if the BloodRequest does not exist
  - Call `matchingEngine.runForRequest(requestId, io)` and return `{ message, matched: N }`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Checkpoint — Ensure all server-side tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Extend `NotificationContext.jsx` on the frontend
  - [x] 9.1 Emit `joinRoom` with the authenticated user's ID on socket connect
    - After the socket is created, emit `socket.emit("joinRoom", userId)` using the user ID from `localStorage`
    - _Requirements: 6.1_

  - [x] 9.2 Handle `donorMatchNotification` Socket.IO events
    - Listen for `donorMatchNotification` and call `add(...)` with `type: "donorMatch"`, a title indicating a blood request match, a body containing `bloodGroup`, `hospital`, and `city`, and a `link` to the active requests page
    - Emit a browser push notification when `Notification.permission === "granted"`
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 9.3 Write property test for frontend notification entry structure — Property 9
    - **Property 9: Frontend notification entry structure**
    - **Validates: Requirements 6.1**
    - Generate random `donorMatchNotification` payloads; simulate the socket event in NotificationContext; assert the added entry has `type === "donorMatch"`, a non-empty `title`, and a `body` containing `bloodGroup`, `hospital`, and `city`
    - `// Feature: smart-donor-matching, Property 9: frontend notification entry structure`

  - [x] 9.4 Fetch and merge persisted notifications on mount
    - When the user is authenticated, fetch `GET /api/notifications` on mount and merge results with localStorage notifications, deduplicating by notification `_id`
    - _Requirements: 6.3_

  - [ ]* 9.5 Write property test for frontend deduplication on merge — Property 10
    - **Property 10: Frontend deduplication on merge**
    - **Validates: Requirements 6.3**
    - Generate random arrays of local and server notifications with overlapping IDs; assert the merged result contains no duplicate IDs
    - `// Feature: smart-donor-matching, Property 10: frontend deduplication on merge`

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** (server) and **fast-check + React Testing Library** (frontend)
- Integration tests for `runForRequest` use **mongodb-memory-server** to avoid touching the real database
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
