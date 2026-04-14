# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Hospital Artifacts Still Present
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate hospital artifacts are present and reachable
  - **Scoped PBT Approach**: For each artifact category, check concrete known cases to ensure reproducibility
  - Check that `client/src/hospital/` directory exists and contains all 11 component files (from Bug Condition in design)
  - Check that `App.jsx` contains hospital import statements and hospital route blocks
  - Check that `server.js` imports `hospitalRoutes` and mounts `/api/hospital`
  - Check that `authMiddleware.js` exports `isHospital`
  - Check that `ProtectedRoute.jsx` contains `hospitalOnly` prop and `"hospital"` role check
  - Check that `server/models/Hospital.js`, `Patient.js`, `DonorAppointment.js`, `BloodMarketplace.js` exist
  - Check that `server/routes/hospitalRoutes.js` exists
  - The test assertions should match the Expected Behavior Properties from design (2.1–2.7): none of these artifacts should exist
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "`client/src/hospital/` exists with 11 files", "`App.jsx` contains HospitalLayout import", "`isHospital` is exported from authMiddleware")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Hospital Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `authMiddleware.js` exports `verifyToken` and `isAdmin` on unfixed code
  - Observe: `ProtectedRoute` enforces `adminOnly` correctly on unfixed code
  - Observe: non-hospital API routes (`/api/auth`, `/api/admin`, `/api/donor`, etc.) respond correctly on unfixed code
  - Observe: `Alert` model and `BloodRequest` model function correctly (their `hospital` fields are plain strings, not DB references)
  - Write property-based tests: for all non-hospital routes and middleware invocations, behavior is identical before and after fix (from Preservation Requirements in design)
  - Include tests for: `verifyToken` behavior, `isAdmin` behavior, `ProtectedRoute` with `adminOnly`, admin API routes, user/donor API routes
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Remove hospital system

  - [x] 3.1 Delete client/src/hospital/ directory (all 11 component files)
    - Delete `HospitalAlerts.jsx`, `HospitalAppointments.jsx`, `HospitalDashboard.jsx`, `HospitalDonors.jsx`
    - Delete `HospitalInventory.jsx`, `HospitalLayout.jsx`, `HospitalMarketplace.jsx`, `HospitalPatients.jsx`
    - Delete `HospitalProfile.jsx`, `HospitalRegister.jsx`, `HospitalRequests.jsx`
    - _Bug_Condition: isBugCondition(artifact) where artifact.path MATCHES "client/src/hospital/**"_
    - _Expected_Behavior: client/src/hospital/ directory SHALL NOT exist (requirement 2.7)_
    - _Preservation: No non-hospital files are affected by this deletion_
    - _Requirements: 1.7, 2.7_

  - [x] 3.2 Remove hospital imports and routes from App.jsx
    - Remove all 10 hospital component import statements under the `HOSPITAL PAGES` comment block
    - Remove `<Route path="/hospital/register" element={<HospitalRegister />} />` public route
    - Remove the entire `<Route path="/hospital" element={<ProtectedRoute hospitalOnly={true}>...}>` block and all child routes
    - _Bug_Condition: isBugCondition(artifact) where artifact IS import OF hospital components IN App.jsx_
    - _Expected_Behavior: App.jsx SHALL NOT import or reference any hospital components and SHALL compile without errors (requirement 2.2)_
    - _Preservation: All admin, user, and donor routes in App.jsx remain untouched (requirements 3.1, 3.2)_
    - _Requirements: 1.2, 2.2, 3.1, 3.2_

  - [x] 3.3 Remove hospitalOnly prop and hospital role check from ProtectedRoute.jsx
    - Remove `hospitalOnly` from the function parameter destructuring
    - Delete the line `if (hospitalOnly && user?.role !== "hospital") return <Navigate to="/dashboard" />;`
    - _Bug_Condition: isBugCondition(artifact) where artifact IS prop hospitalOnly OR role check FOR "hospital" IN ProtectedRoute_
    - _Expected_Behavior: ProtectedRoute SHALL NOT contain hospitalOnly prop or "hospital" role check (requirement 2.3)_
    - _Preservation: adminOnly enforcement must remain completely unchanged (requirement 3.5)_
    - _Requirements: 1.3, 2.3, 3.5_

  - [x] 3.4 Remove hospitalRoutes import and mount from server.js
    - Delete `import hospitalRoutes from "./routes/hospitalRoutes.js";`
    - Delete `app.use("/api/hospital", hospitalRoutes);`
    - _Bug_Condition: isBugCondition(artifact) where artifact IS route registration FOR "/api/hospital" OR import OF hospitalRoutes IN server.js_
    - _Expected_Behavior: server.js SHALL NOT import or mount hospitalRoutes; requests to /api/hospital/* SHALL return 404 (requirement 2.4)_
    - _Preservation: All other app.use() route registrations remain untouched (requirement 3.3)_
    - _Requirements: 1.4, 2.4, 3.3_

  - [x] 3.5 Delete server/routes/hospitalRoutes.js
    - Delete the entire `server/routes/hospitalRoutes.js` file
    - _Bug_Condition: isBugCondition(artifact) where artifact IS file hospitalRoutes.js IN server/routes/_
    - _Expected_Behavior: hospitalRoutes.js SHALL NOT exist on disk_
    - _Preservation: No other route files are affected_
    - _Requirements: 1.4, 2.4_

  - [x] 3.6 Delete hospital-only server models
    - Delete `server/models/Hospital.js`
    - Delete `server/models/Patient.js`
    - Delete `server/models/DonorAppointment.js`
    - Delete `server/models/BloodMarketplace.js`
    - _Bug_Condition: isBugCondition(artifact) where artifact IS file Hospital.js | Patient.js | DonorAppointment.js | BloodMarketplace.js IN server/models/_
    - _Expected_Behavior: server SHALL NOT import or reference these models (requirement 2.5)_
    - _Preservation: Alert model and BloodRequest model are unaffected — their hospital fields are plain strings, not DB references (requirements 3.6, 3.7)_
    - _Requirements: 1.5, 2.5, 3.6, 3.7_

  - [x] 3.7 Remove isHospital export from authMiddleware.js
    - Delete the entire `HOSPITAL ONLY` comment block and `isHospital` function export
    - _Bug_Condition: isBugCondition(artifact) where artifact IS export isHospital IN authMiddleware.js_
    - _Expected_Behavior: authMiddleware.js SHALL NOT export isHospital and SHALL compile without errors (requirement 2.6)_
    - _Preservation: verifyToken and isAdmin exports must remain completely unchanged (requirement 3.4)_
    - _Requirements: 1.6, 2.6, 3.4_

  - [x] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - No Hospital Artifact Is Present or Reachable
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (requirements 2.1–2.7)
    - When this test passes, it confirms all hospital artifacts have been removed
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Hospital Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all non-hospital routes, middleware, and models behave identically after the fix
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
