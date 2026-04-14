# Find Donor Self-Exclude Bugfix Design

## Overview

When a logged-in user searches for donors on `/find-donor`, their own donor profile appears in the results. This is confusing — a user has no reason to contact themselves. The fix has two parts: (1) make the backend `/search/:bloodGroup` route optionally accept an auth token and exclude the requesting user's own donor record, and (2) update `FindDonor.jsx` to send the auth token via the shared `API` service instead of raw `axios`.

The fix is intentionally minimal: the search route becomes token-optional (unauthenticated requests continue to work unchanged), and the exclusion is a single `$ne` filter added to the existing `Donor.find` query.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — a logged-in user whose donor profile matches the searched blood group receives their own record in the results
- **Property (P)**: The desired behavior when the bug condition holds — the response array must not contain a donor whose `user` field equals the requesting user's ID
- **Preservation**: All search behavior for unauthenticated users, mismatched blood groups, sorting, and admin views must remain exactly unchanged
- **searchDonors (F)**: The current `GET /api/donor/search/:bloodGroup` handler in `server/routes/donorRoutes.js` — performs `Donor.find({ bloodGroup })` with no user context
- **searchDonors' (F')**: The fixed handler — performs `Donor.find({ bloodGroup, user: { $ne: currentUserId } })` when a valid token is present, otherwise identical to F
- **verifyToken**: The optional middleware in `server/middleware/authMiddleware.js` that decodes the JWT and sets `req.user`; in the fixed route it is applied in a non-blocking way so unauthenticated requests still succeed
- **API service**: `client/src/services/api.jsx` — a pre-configured axios instance that automatically attaches the `Authorization: Bearer <token>` header from `localStorage`

## Bug Details

### Bug Condition

The bug manifests when a logged-in user searches for donors by blood group and their own donor profile has the same blood group. The `/search/:bloodGroup` route has no auth middleware, so it never receives the requesting user's identity and cannot exclude them. `FindDonor.jsx` uses raw `axios` (not the `API` service), so even if the route were protected, no token would be sent.

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X of type SearchRequest { bloodGroup, requestingUserId }
  OUTPUT: boolean

  RETURN X.requestingUserId IS NOT NULL
    AND EXISTS donor WHERE donor.user  = X.requestingUserId
                      AND donor.bloodGroup = X.bloodGroup
END FUNCTION
```

### Examples

- User with blood group A+ searches for A+ donors → their own card appears in results (bug)
- User with blood group O- searches for O- donors → their own card appears in results (bug)
- User with blood group B+ searches for A+ donors → their own record is B+, not returned anyway (no bug, but fix must not break this)
- Unauthenticated visitor searches for A+ donors → all A+ donors returned, no exclusion needed (no bug, fix must not break this)
- User is the only A+ donor → after fix, results are empty and "No Donors Found" is shown (edge case, correct behavior)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Unauthenticated searches must continue to return all matching donors without any exclusion
- Searching a blood group the user does not belong to must return all matching donors of that group
- The availability-first sort order must be preserved after the exclusion filter is applied
- The "No Donors Found" empty state must appear when no other donors match (including when the user is the only match)
- The admin `/all` endpoint is a separate route and must remain completely unaffected

**Scope:**
All requests that do NOT satisfy `isBugCondition` — unauthenticated requests, requests where the user has no donor profile, or requests where the user's blood group differs from the searched group — must produce results identical to the current (unfixed) behavior.

## Hypothesized Root Cause

Based on code inspection, there are two independent causes that together produce the bug:

1. **Missing auth middleware on the search route**: `GET /api/donor/search/:bloodGroup` in `donorRoutes.js` has no `verifyToken` middleware. `req.user` is always `undefined`, so the handler has no way to know who is searching.

2. **Frontend uses raw axios instead of the API service**: `FindDonor.jsx` imports `axios` directly and calls `axios.get(...)`. The shared `API` service in `client/src/services/api.jsx` has a request interceptor that attaches `Authorization: Bearer <token>` automatically. Because raw axios is used, no token is sent even when the user is logged in.

3. **No exclusion filter in the query**: Even if the token were available, the current query `Donor.find({ bloodGroup })` has no mechanism to exclude a specific user. The fix must add `user: { $ne: currentUserId }` when a user ID is present.

## Correctness Properties

Property 1: Bug Condition - Own Donor Profile Excluded from Search Results

_For any_ search request where `isBugCondition` holds (the requesting user is authenticated and has a donor profile matching the searched blood group), the fixed `searchDonors'` function SHALL return a results array that contains no donor document whose `user` field equals the requesting user's ID.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Unauthenticated and Non-Matching Searches Unchanged

_For any_ search request where `isBugCondition` does NOT hold (unauthenticated request, or user has no matching donor profile), the fixed `searchDonors'` function SHALL return the same set of donor documents, in the same availability-first order, as the original `searchDonors` function.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File 1**: `server/routes/donorRoutes.js`

**Route**: `GET /search/:bloodGroup`

**Specific Changes**:
1. **Apply verifyToken as optional middleware**: Replace the current anonymous async handler with a two-step approach — first run `verifyToken` in a try/catch (or use a wrapper) that sets `req.user` if a valid token is present but calls `next()` regardless. This keeps the route accessible to unauthenticated users.
2. **Add conditional exclusion filter**: When `req.user` is defined, add `user: { $ne: req.user.id }` to the `Donor.find` query. When `req.user` is undefined (unauthenticated), the query remains `Donor.find({ bloodGroup })` — identical to today.

**Concrete implementation sketch**:
```js
// Optional auth: populate req.user if token present, but never block
router.get("/search/:bloodGroup", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch (_) { /* invalid token — treat as unauthenticated */ }
  }
  next();
}, async (req, res) => {
  const bloodGroup = decodeURIComponent(req.params.bloodGroup);
  const filter = { bloodGroup };
  if (req.user?.id) filter.user = { $ne: req.user.id };

  const donors = await Donor.find(filter).populate("user").lean();
  donors.forEach(d => d.availability = Boolean(d.availability));
  donors.sort((a, b) => b.availability - a.availability);
  res.json(donors);
});
```

---

**File 2**: `client/src/pages/FindDonor.jsx`

**Function**: `searchDonor`

**Specific Changes**:
1. **Replace raw axios import with API service**: Remove `import axios from "axios"` and add `import API from "../services/api"`.
2. **Use API instead of axios for the search call**: Change `axios.get(...)` to `API.get(...)` and use the relative path `/donor/search/${encodeURIComponent(bloodGroup)}` (the base URL is already set in the API service).

**Concrete implementation sketch**:
```js
// Before
import axios from "axios";
const res = await axios.get(`http://localhost:5000/api/donor/search/${encodeURIComponent(bloodGroup)}`);

// After
import API from "../services/api";
const res = await API.get(`/donor/search/${encodeURIComponent(bloodGroup)}`);
```

## Testing Strategy

### Validation Approach

Testing follows two phases: first run exploratory tests against the **unfixed** code to confirm the bug and root cause, then run fix-checking and preservation tests against the **fixed** code.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug on unfixed code and confirm the root cause analysis.

**Test Plan**: Create a test donor record linked to a known user ID, then call `GET /api/donor/search/:bloodGroup` with that user's auth token and assert the response contains the user's own donor. This should pass on unfixed code (confirming the bug) and fail after the fix.

**Test Cases**:
1. **Authenticated search returns own profile**: Seed a user + matching donor, call search with token → assert own donor IS in results (demonstrates bug on unfixed code)
2. **No token sent — all donors returned**: Call search without token → assert all matching donors are returned (baseline for preservation)
3. **Mismatched blood group — no self-exclusion needed**: User is A+, search B+ → assert all B+ donors returned (no exclusion expected)
4. **User is only matching donor**: Seed user as the only A+ donor, search A+ with token → on unfixed code, one result returned (the user themselves)

**Expected Counterexamples**:
- On unfixed code: own donor record appears in authenticated search results
- Root cause confirmed: no `Authorization` header is sent (raw axios), and no exclusion filter exists in the query

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function excludes the user's own donor record.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  results := searchDonors'(X.bloodGroup, X.requestingUserId)
  ASSERT NOT EXISTS d IN results WHERE d.user = X.requestingUserId
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT searchDonors(X.bloodGroup, null) = searchDonors'(X.bloodGroup, null)
END FOR
```

**Testing Approach**: Property-based testing is well-suited here because:
- It generates many random blood group / user combinations automatically
- It catches edge cases (empty results, single donor, all unavailable) that manual tests miss
- It provides strong guarantees that unauthenticated behavior is unchanged across the full input domain

**Test Cases**:
1. **Unauthenticated search preservation**: For any blood group, unauthenticated search returns all matching donors — same count and same IDs as before the fix
2. **Sort order preservation**: For any result set returned by the fixed route, available donors always appear before unavailable ones
3. **Mismatched blood group preservation**: When user's blood group ≠ searched blood group, result set is identical to unauthenticated result

### Unit Tests

- Test the optional-auth middleware: valid token sets `req.user`, invalid token leaves `req.user` undefined, missing header leaves `req.user` undefined
- Test the exclusion filter: when `req.user.id` is set, `Donor.find` is called with `{ bloodGroup, user: { $ne: id } }`; when not set, called with `{ bloodGroup }` only
- Test `FindDonor.jsx` uses `API` (not raw axios) so the Authorization header is present in the outgoing request

### Property-Based Tests

- Generate random sets of donor records with varying blood groups and user IDs; assert that for any authenticated search, no returned donor has `user === requestingUserId`
- Generate random unauthenticated search inputs; assert result count and IDs are identical between fixed and unfixed implementations
- Generate random result arrays with mixed availability; assert sort is stable and availability-first after the exclusion filter is applied

### Integration Tests

- Full flow: register user, become donor, search for own blood group while logged in → own card must not appear
- Full flow: search while logged out → all matching donors appear (no exclusion)
- Edge case: user is the only donor of their blood group → authenticated search returns empty array and UI shows "No Donors Found"
- Admin `/all` endpoint: verify it still returns all donors including the admin's own record (separate route, unaffected)
