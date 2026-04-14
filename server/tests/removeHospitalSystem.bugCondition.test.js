/**
 * Bug Condition Exploration Test
 * Property 1: Hospital Artifacts Still Present in Codebase
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists — hospital artifacts ARE present.
 * This test encodes the EXPECTED (correct) behavior and will pass after the fix.
 *
 * Bug Condition (isBugCondition):
 *   artifact.path MATCHES "client/src/hospital/**"
 *   OR artifact IS import OF hospital components IN App.jsx
 *   OR artifact IS prop hospitalOnly OR role check "hospital" IN ProtectedRoute.jsx
 *   OR artifact IS route registration FOR "/api/hospital" OR import OF hospitalRoutes IN server.js
 *   OR artifact IS file hospitalRoutes.js IN server/routes/
 *   OR artifact IS file Hospital.js | Patient.js | DonorAppointment.js | BloodMarketplace.js IN server/models/
 *   OR artifact IS export isHospital IN authMiddleware.js
 *
 * Counterexamples documented (on unfixed code):
 *   - client/src/hospital/ directory exists with 11 component files
 *   - App.jsx contains HospitalLayout import and hospital route blocks
 *   - server.js imports hospitalRoutes and mounts /api/hospital
 *   - authMiddleware.js exports isHospital
 *   - ProtectedRoute.jsx contains hospitalOnly prop and "hospital" role check
 *   - server/models/Hospital.js, Patient.js, DonorAppointment.js, BloodMarketplace.js exist
 *   - server/routes/hospitalRoutes.js exists
 */

import { describe, it } from "vitest";
import { expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve workspace root (two levels up from server/tests/)
const ROOT = path.resolve(__dirname, "..", "..");

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readContent(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

describe("Bug Condition: Hospital artifacts are present and reachable", () => {
  /**
   * Requirement 2.7 — client/src/hospital/ directory SHALL NOT exist
   * On UNFIXED code: directory exists → assertion FAILS → bug confirmed.
   */
  it("client/src/hospital/ directory should NOT exist (Req 2.7)", () => {
    const dirExists = exists("client/src/hospital");
    // Expected correct behavior: false. On unfixed code this is true → FAILS.
    expect(dirExists).toBe(false);
  });

  /**
   * Requirement 2.7 — all 11 hospital component files SHALL NOT exist
   * On UNFIXED code: all files exist → assertions FAIL → bug confirmed.
   */
  it("client/src/hospital/ should NOT contain any of the 11 hospital component files (Req 2.7)", () => {
    const hospitalFiles = [
      "client/src/hospital/HospitalAlerts.jsx",
      "client/src/hospital/HospitalAppointments.jsx",
      "client/src/hospital/HospitalDashboard.jsx",
      "client/src/hospital/HospitalDonors.jsx",
      "client/src/hospital/HospitalInventory.jsx",
      "client/src/hospital/HospitalLayout.jsx",
      "client/src/hospital/HospitalMarketplace.jsx",
      "client/src/hospital/HospitalPatients.jsx",
      "client/src/hospital/HospitalProfile.jsx",
      "client/src/hospital/HospitalRegister.jsx",
      "client/src/hospital/HospitalRequests.jsx",
    ];
    for (const file of hospitalFiles) {
      // Expected correct behavior: each file does NOT exist.
      // On unfixed code all exist → FAILS.
      expect(exists(file), `${file} should not exist`).toBe(false);
    }
  });

  /**
   * Requirement 2.2 — App.jsx SHALL NOT import any hospital components
   * On UNFIXED code: imports are present → assertion FAILS → bug confirmed.
   */
  it("App.jsx should NOT contain hospital import statements (Req 2.2)", () => {
    const content = readContent("client/src/App.jsx");
    const hospitalImports = [
      "HospitalLayout",
      "HospitalDashboard",
      "HospitalInventory",
      "HospitalRequests",
      "HospitalAlerts",
      "HospitalDonors",
      "HospitalProfile",
      "HospitalRegister",
      "HospitalAppointments",
      "HospitalMarketplace",
    ];
    for (const name of hospitalImports) {
      // Expected correct behavior: import is NOT present.
      // On unfixed code all imports exist → FAILS.
      expect(content, `App.jsx should not import ${name}`).not.toContain(
        `import ${name}`
      );
    }
  });

  /**
   * Requirement 2.2 — App.jsx SHALL NOT contain hospital route blocks
   * On UNFIXED code: route blocks are present → assertion FAILS → bug confirmed.
   */
  it("App.jsx should NOT contain hospital route registrations (Req 2.2)", () => {
    const content = readContent("client/src/App.jsx");
    // Expected correct behavior: no hospital route paths.
    // On unfixed code these exist → FAILS.
    expect(content).not.toContain('path="/hospital"');
    expect(content).not.toContain('path="/hospital/register"');
    expect(content).not.toContain("hospitalOnly");
  });

  /**
   * Requirement 2.4 — server.js SHALL NOT import or mount hospitalRoutes
   * On UNFIXED code: import and mount are present → assertions FAIL → bug confirmed.
   */
  it("server.js should NOT import hospitalRoutes (Req 2.4)", () => {
    const content = readContent("server/server.js");
    // Expected correct behavior: no hospitalRoutes import.
    // On unfixed code this import exists → FAILS.
    expect(content).not.toContain("hospitalRoutes");
  });

  /**
   * Requirement 2.4 — server.js SHALL NOT mount /api/hospital
   * On UNFIXED code: mount is present → assertion FAILS → bug confirmed.
   */
  it("server.js should NOT mount /api/hospital route (Req 2.4)", () => {
    const content = readContent("server/server.js");
    // Expected correct behavior: no /api/hospital mount.
    // On unfixed code this mount exists → FAILS.
    expect(content).not.toContain("/api/hospital");
  });

  /**
   * Requirement 2.6 — authMiddleware.js SHALL NOT export isHospital
   * On UNFIXED code: isHospital is exported → assertion FAILS → bug confirmed.
   */
  it("authMiddleware.js should NOT export isHospital (Req 2.6)", () => {
    const content = readContent("server/middleware/authMiddleware.js");
    // Expected correct behavior: isHospital is NOT exported.
    // On unfixed code it is exported → FAILS.
    expect(content).not.toContain("isHospital");
  });

  /**
   * Requirement 2.3 — ProtectedRoute.jsx SHALL NOT contain hospitalOnly prop or "hospital" role check
   * On UNFIXED code: both are present → assertions FAIL → bug confirmed.
   */
  it("ProtectedRoute.jsx should NOT contain hospitalOnly prop or hospital role check (Req 2.3)", () => {
    const content = readContent("client/src/components/ProtectedRoute.jsx");
    // Expected correct behavior: no hospitalOnly, no "hospital" role check.
    // On unfixed code both exist → FAILS.
    expect(content).not.toContain("hospitalOnly");
    expect(content).not.toContain('"hospital"');
  });

  /**
   * Requirement 2.5 — hospital-only server models SHALL NOT exist
   * On UNFIXED code: all four files exist → assertions FAIL → bug confirmed.
   */
  it("server/models/Hospital.js should NOT exist (Req 2.5)", () => {
    expect(exists("server/models/Hospital.js")).toBe(false);
  });

  it("server/models/Patient.js should NOT exist (Req 2.5)", () => {
    expect(exists("server/models/Patient.js")).toBe(false);
  });

  it("server/models/DonorAppointment.js should NOT exist (Req 2.5)", () => {
    expect(exists("server/models/DonorAppointment.js")).toBe(false);
  });

  it("server/models/BloodMarketplace.js should NOT exist (Req 2.5)", () => {
    expect(exists("server/models/BloodMarketplace.js")).toBe(false);
  });

  /**
   * Requirement 2.4 — server/routes/hospitalRoutes.js SHALL NOT exist
   * On UNFIXED code: file exists → assertion FAILS → bug confirmed.
   */
  it("server/routes/hospitalRoutes.js should NOT exist (Req 2.4)", () => {
    expect(exists("server/routes/hospitalRoutes.js")).toBe(false);
  });
});
