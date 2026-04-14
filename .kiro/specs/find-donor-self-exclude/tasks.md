# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Own Donor Profile Appears in Authenticated Search Results
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — a user whose blood group matches the searched group
  - Create test file at `server/tests/findDonorSelfExclude.bugCondition.test.js`
  - Seed a User (e.g. bloodGroup: "A+") and a linked Donor record (bloodGroup: "A+", user: seededUser._id)
  - Call `GET /api/donor/search/A%2B` with `Authorization: Bearer <token>` for the seeded user
  - Assert the response array DOES NOT contain a donor whose `user` field equals the seeded user's ID (this is the expected behavior per isBugCondition)
  - On unfixed code the assertion FAILS — the user's own donor card IS present — confirming the bug
  - Document the counterexample: `searchDonors("A+", userId)` returns the user's own donor record
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unauthenticated and Non-Matching Searches Return Unchanged Results
  - **IMPORTANT**: Follow observation-first methodology
  - Create test file at `server/tests/findDonorSelfExclude.preservation.test.js`
  - Observe: `GET /api/donor/search/A%2B` with NO token returns all A+ donors (baseline count N)
  - Observe: `GET /api/donor/search/B%2B` with a token for an A+ user returns all B+ donors unchanged
  - Observe: results are sorted available-first regardless of auth state
  - Write property-based tests:
    - For all blood groups, unauthenticated search returns the same donor IDs and count as the current unfixed code
    - For all blood groups where the user's blood group differs from the searched group, result set is identical to unauthenticated result
    - For any result array, available donors always appear before unavailable ones (sort preservation)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix: exclude own donor profile from authenticated search results

  - [x] 3.1 Add optional auth middleware to the search route in `server/routes/donorRoutes.js`
    - Import `jwt` from `"jsonwebtoken"` at the top of the file
    - Replace the current `router.get("/search/:bloodGroup", async (req, res) => { ... })` handler with a two-handler approach
    - First handler: inline optional-auth middleware — reads `req.headers.authorization`, attempts `jwt.verify`, sets `req.user` on success, calls `next()` regardless (never blocks unauthenticated requests)
    - Second handler: existing async query handler, now conditionally adds `user: { $ne: req.user.id }` to the filter when `req.user` is defined
    - _Bug_Condition: isBugCondition(X) where X.requestingUserId IS NOT NULL AND EXISTS donor WHERE donor.user = X.requestingUserId AND donor.bloodGroup = X.bloodGroup_
    - _Expected_Behavior: results array contains no donor whose `user` field equals req.user.id_
    - _Preservation: when req.user is undefined (no token or invalid token), filter remains `{ bloodGroup }` — identical to current behavior_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Update `FindDonor.jsx` to send the auth token via the API service
    - Remove `import axios from "axios"` from `client/src/pages/FindDonor.jsx`
    - Add `import API from "../services/api"` (the shared axios instance that auto-attaches `Authorization: Bearer <token>`)
    - Change the search call from `axios.get(\`http://localhost:5000/api/donor/search/...\`)` to `API.get(\`/donor/search/...\`)`
    - _Bug_Condition: without this change no token is sent, so req.user is always undefined even after 3.1_
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Own Donor Profile Excluded from Search Results
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run `server/tests/findDonorSelfExclude.bugCondition.test.js` against the fixed code
    - **EXPECTED OUTCOME**: Test PASSES (confirms the user's own donor record is no longer returned)
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Unauthenticated and Non-Matching Searches Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run `server/tests/findDonorSelfExclude.preservation.test.js` against the fixed code
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in unauthenticated or mismatched-group searches)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite and confirm both the bug condition test and all preservation tests pass
  - Manually verify the edge case: if the logged-in user is the only donor of their blood group, the search returns an empty list and the UI shows "No Donors Found"
  - Confirm the admin `/all` endpoint is unaffected (separate route, no changes made)
  - Ask the user if any questions arise before closing the spec
