# Design Document: Smart Donor Matching

## Overview

Smart Donor Matching automatically identifies eligible blood donors when a BloodRequest is created and delivers real-time in-app notifications to those donors. The feature runs entirely server-side, integrates with the existing Socket.IO infrastructure, and persists notifications in a new `Notification` MongoDB collection. Admins can also manually re-trigger matching for any existing request.

The matching pipeline is:

```
BloodRequest created
       │
       ▼
Matching Engine
  1. Resolve compatible blood groups (compatibility map)
  2. Query Donors: same city (case-insensitive), compatible blood group,
     availability=true, lastDonationDate > 90 days ago (or null),
     user ≠ requester
       │
       ▼
  For each eligible donor:
    3. Persist Notification_Record (skip if duplicate)
    4. Emit donorMatchNotification via Socket.IO
       │
       ▼
  Return { matched: N }
```

---

## Architecture

The feature adds three new server-side artifacts and extends two existing client-side files:

```
server/
  services/
    matchingEngine.js        ← pure matching logic (reusable)
  routes/
    notificationRoutes.js    ← GET /notifications, GET /notifications/unread-count, PATCH /notifications/:id/read
  models/
    Notification.js          ← new persisted notification model

client/src/
  context/
    NotificationContext.jsx  ← extended: donorMatchNotification handler + server fetch on load
```

The existing `requestRoutes.js` POST `/create` handler calls `matchingEngine.runForRequest(requestId, io)` after saving the request. A new admin route `POST /api/admin/match/:requestId` also calls the same engine.

### Socket.IO Room Strategy

To deliver notifications only to the intended donor, each authenticated client joins a personal room named after their user ID. The server emits `donorMatchNotification` to `io.to(userId)` rather than broadcasting to all clients.

```
Client connects → socket.join(userId)
Server emits   → io.to(donorUserId).emit("donorMatchNotification", payload)
```

This requires a small addition to the `io.on("connection")` handler in `server.js`.

---

## Components and Interfaces

### 1. `matchingEngine.js` (new service)

```js
// Returns { matched: number, donors: Donor[] }
async function runForRequest(requestId, io)

// Pure function — no DB access
// Returns array of compatible donor blood groups for a given recipient group
// Throws if bloodGroup is not in the compatibility map
function getCompatibleDonorGroups(recipientBloodGroup)

// Returns true if donor is eligible (availability, 90-day rule, self-exclusion)
function isDonorEligible(donor, requesterUserId)
```

### 2. `Notification` model (new)

See Data Models section.

### 3. `notificationRoutes.js` (new)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | verifyToken | All notifications for authenticated user, newest first |
| GET | `/api/notifications/unread-count` | verifyToken | `{ count: N }` |
| PATCH | `/api/notifications/:id/read` | verifyToken | Mark one notification as read |

### 4. Admin matching endpoint (added to `adminRoutes.js`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/match/:requestId` | verifyToken + isAdmin | Trigger matching for existing request |

Response: `{ message, matched: N }`

### 5. `requestRoutes.js` — POST `/create` (modified)

After `await request.save()`, add:

```js
const io = req.app.get("io");
matchingEngine.runForRequest(request._id, io).catch(console.error);
```

The matching runs asynchronously so the request creation response is not delayed.

### 6. `server.js` — Socket.IO connection handler (modified)

```js
io.on("connection", (socket) => {
  // existing code ...
  socket.on("joinRoom", (userId) => {
    if (userId) socket.join(userId);
  });
});
```

### 7. `NotificationContext.jsx` (modified)

- Emit `joinRoom` with the authenticated user's ID on socket connect.
- Listen for `donorMatchNotification` events and call `add(...)`.
- On mount (when authenticated), fetch `/api/notifications` and merge with localStorage notifications, deduplicating by `_id`.

---

## Data Models

### Notification (new)

```js
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodRequest",
    required: true
  },
  type: {
    type: String,
    enum: ["donorMatch"],
    default: "donorMatch"
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index to prevent duplicate notifications per donor per request
notificationSchema.index({ user: 1, request: 1 }, { unique: true });
```

### BloodRequest (unchanged)

Existing fields are sufficient. The matching engine reads `bloodGroup`, `city`, and `user` from this model.

### Donor (unchanged)

Existing fields `bloodGroup`, `city`, `availability`, `lastDonationDate`, and `user` are all used by the matching engine.

---

## Blood Group Compatibility Map

The compatibility map is defined as a constant in `matchingEngine.js`:

```js
const COMPATIBILITY = {
  "O-":  ["O-","O+","A-","A+","B-","B+","AB-","AB+"],
  "O+":  ["O+","A+","B+","AB+"],
  "A-":  ["A-","A+","AB-","AB+"],
  "A+":  ["A+","AB+"],
  "B-":  ["B-","B+","AB-","AB+"],
  "B+":  ["B+","AB+"],
  "AB-": ["AB-","AB+"],
  "AB+": ["AB+"]
};
```

`getCompatibleDonorGroups(recipientBloodGroup)` inverts this map: it returns all donor blood groups whose compatible-recipient list includes `recipientBloodGroup`.

Example: recipient = `"A+"` → compatible donors = `["O-", "O+", "A-", "A+"]`

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Compatibility map inversion correctness

*For any* valid donor blood group `D` and recipient blood group `R` drawn from the 8 standard blood groups, `D` appears in `getCompatibleDonorGroups(R)` if and only if `R` appears in `COMPATIBILITY[D]`.

**Validates: Requirements 2.1, 2.2**

---

### Property 2: Invalid blood group yields error

*For any* string that is not one of the 8 valid blood group keys, calling `getCompatibleDonorGroups` with that string SHALL throw an error — never silently return an empty list or partial result.

**Validates: Requirements 2.3**

---

### Property 3: Eligible donor filter correctness

*For any* donor record and requester user ID, `isDonorEligible` returns `true` if and only if all three conditions hold simultaneously: `availability === true`, `lastDonationDate` is null or strictly more than 90 days before the current date, and `donor.user` does not equal the requester user ID. If any single condition fails, the function must return `false`.

**Validates: Requirements 1.3, 1.4, 1.5, 5.1, 5.2**

---

### Property 4: Self-exclusion end-to-end invariant

*For any* blood request created by user U and any donor pool (including donors whose `user` field equals U), the set of Notification_Records created by `runForRequest` SHALL contain no record whose `user` field equals U.

**Validates: Requirements 1.5, 5.1, 5.3**

---

### Property 5: No duplicate notifications (idempotence)

*For any* blood request R and eligible donor D, running `runForRequest` one or more times SHALL result in exactly one Notification_Record with `{ user: D.user, request: R._id }` in the database — never zero, never more than one.

**Validates: Requirements 4.3**

---

### Property 6: Notification record completeness

*For any* Notification_Record created by the matching engine, the record SHALL contain non-null values for `user`, `request`, `type` (= `"donorMatch"`), `message`, and `read` (= `false`).

**Validates: Requirements 3.1**

---

### Property 7: Notifications returned in descending order

*For any* set of Notification_Records belonging to a user, the GET `/api/notifications` endpoint SHALL return them ordered by `createdAt` descending — the most recently created notification is always first.

**Validates: Requirements 3.4**

---

### Property 8: Unread count accuracy

*For any* set of Notification_Records for a user with varying `read` statuses, the GET `/api/notifications/unread-count` endpoint SHALL return a count equal to the number of records where `read === false`.

**Validates: Requirements 3.6**

---

### Property 9: Frontend notification entry structure

*For any* `donorMatchNotification` Socket.IO payload received by the frontend, the notification entry added to `NotificationContext` state SHALL have `type === "donorMatch"`, a non-empty `title`, and a `body` string that contains the `bloodGroup`, `hospital`, and `city` values from the payload.

**Validates: Requirements 6.1**

---

### Property 10: Frontend deduplication on merge

*For any* combination of locally stored notifications and server-fetched Notification_Records with overlapping IDs, the merged result in `NotificationContext` SHALL contain no two entries with the same notification ID.

**Validates: Requirements 6.3**

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid blood group passed to engine | Throw `Error("Invalid blood group: <value>")` — caught by caller, returns 400 |
| BloodRequest ID not found (admin trigger) | Return HTTP 404 with `{ message: "Blood request not found" }` |
| No eligible donors found | Engine completes normally, returns `{ matched: 0 }` |
| Duplicate notification insert (race condition) | MongoDB unique index violation caught and silently skipped (not an error) |
| Socket.IO emit to disconnected donor | No-op — notification is persisted and retrieved on next load |
| Matching engine throws unexpectedly | Error logged server-side; request creation response is unaffected (async call) |

---

## Testing Strategy

### Unit Tests (example-based)

- `getCompatibleDonorGroups("A+")` returns exactly `["O-", "O+", "A-", "A+"]`
- `getCompatibleDonorGroups("AB+")` returns all 8 blood groups
- `isDonorEligible` returns `false` when `availability === false`
- `isDonorEligible` returns `false` when `lastDonationDate` is 45 days ago
- `isDonorEligible` returns `true` when `lastDonationDate` is 91 days ago
- `isDonorEligible` returns `false` when donor's user ID matches requester ID
- `isDonorEligible` returns `true` for admin-created donor (no `user` field) regardless of requester ID
- Admin endpoint returns 404 for non-existent request ID

### Property-Based Tests

Property-based testing is applicable here because the core matching logic (`getCompatibleDonorGroups`, `isDonorEligible`) consists of pure functions whose correctness must hold across all valid inputs, and the persistence layer has universal invariants (no duplicates, record completeness). The library used is **fast-check** (compatible with the Node.js/Jest stack).

Each property test runs a minimum of **100 iterations**.

Tag format: `Feature: smart-donor-matching, Property N: <property_text>`

**Property 1 — Compatibility map inversion correctness**
Generate random pairs `(donorGroup, recipientGroup)` from the 8 valid blood groups. Assert that `getCompatibleDonorGroups(recipientGroup).includes(donorGroup)` equals `COMPATIBILITY[donorGroup].includes(recipientGroup)`.
`// Feature: smart-donor-matching, Property 1: compatibility map inversion correctness`

**Property 2 — Invalid blood group yields error**
Generate arbitrary strings that are not valid blood group keys. Assert that `getCompatibleDonorGroups(invalidGroup)` throws.
`// Feature: smart-donor-matching, Property 2: invalid blood group yields error`

**Property 3 — Eligible donor filter correctness**
Generate random donor objects (varying `availability`, `lastDonationDate` offset in days, `user` field) and a requester ID. Assert that `isDonorEligible` returns `true` iff all three conditions hold simultaneously.
`// Feature: smart-donor-matching, Property 3: eligible donor filter correctness`

**Property 4 — Self-exclusion end-to-end invariant**
Generate a random request with a known requester user ID and a donor pool including the requester. Run the eligibility filter and assert no result has `user === requesterId`.
`// Feature: smart-donor-matching, Property 4: self-exclusion end-to-end invariant`

**Property 5 — No duplicate notifications** (integration, with in-memory MongoDB via `mongodb-memory-server`)
Generate a request and a set of donors. Call `runForRequest` twice. Assert the Notification collection contains exactly one document per eligible donor.
`// Feature: smart-donor-matching, Property 5: no duplicate notifications (idempotence)`

**Property 6 — Notification record completeness**
Generate random eligible donor/request pairs. After `runForRequest`, fetch all created Notification_Records and assert each has non-null `user`, `request`, `type === "donorMatch"`, `message`, and `read === false`.
`// Feature: smart-donor-matching, Property 6: notification record completeness`

**Property 7 — Notifications returned in descending order**
Generate random sets of Notification_Records with varying `createdAt` timestamps. Assert the GET endpoint returns them sorted newest-first.
`// Feature: smart-donor-matching, Property 7: notifications returned in descending order`

**Property 8 — Unread count accuracy**
Generate random sets of notifications with varying `read` statuses. Assert the unread-count endpoint returns exactly the count of records where `read === false`.
`// Feature: smart-donor-matching, Property 8: unread count accuracy`

**Property 9 — Frontend notification entry structure** (React Testing Library + fast-check)
Generate random `donorMatchNotification` payloads. Simulate the socket event in the NotificationContext. Assert the added entry has `type === "donorMatch"`, a non-empty `title`, and a `body` containing `bloodGroup`, `hospital`, and `city`.
`// Feature: smart-donor-matching, Property 9: frontend notification entry structure`

**Property 10 — Frontend deduplication on merge** (pure function test)
Generate random arrays of local and server notifications with overlapping IDs. Assert the merged result contains no duplicate IDs.
`// Feature: smart-donor-matching, Property 10: frontend deduplication on merge`

### Integration Tests

- POST `/api/request/create` triggers matching and emits `donorMatchNotification` to the correct Socket.IO room
- POST `/api/admin/match/:requestId` returns `{ matched: N }` and skips already-notified donors
- GET `/api/notifications` returns records ordered by `createdAt` descending
- PATCH `/api/notifications/:id/read` sets `read: true`
