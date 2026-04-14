/**
 * Preservation Property Tests
 * Property 2: Non-Hospital Functionality Unchanged
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 *
 * OBSERVATION-FIRST METHODOLOGY:
 *   - Observe: authMiddleware.js exports verifyToken and isAdmin on unfixed code
 *   - Observe: ProtectedRoute enforces adminOnly correctly on unfixed code
 *   - Observe: Non-hospital server models (Alert, BloodRequest, BloodInventory, Camp, etc.) exist
 *   - Observe: Non-hospital route files exist in server/routes/
 *   - Observe: App.jsx contains admin and user routes
 *   - Observe: Alert model's hospital field is a plain String (not a DB reference)
 *   - Observe: BloodRequest model's hospital field is a plain String (not a DB reference)
 *
 * EXPECTED OUTCOME: Tests PASS on UNFIXED code (confirms baseline behavior to preserve).
 * These tests must also PASS after the fix to confirm no regressions.
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

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2a: authMiddleware.js exports verifyToken and isAdmin
 * Validates: Requirements 3.4
 *
 * The middleware file must contain verifyToken and isAdmin exports.
 * These are the only two exports that non-hospital code depends on.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2a: authMiddleware.js exports verifyToken and isAdmin (Req 3.4)", () => {
  it("authMiddleware.js file exists", () => {
    expect(exists("server/middleware/authMiddleware.js")).toBe(true);
  });

  it("authMiddleware.js exports verifyToken", () => {
    const content = readContent("server/middleware/authMiddleware.js");
    expect(content).toContain("export const verifyToken");
  });

  it("authMiddleware.js exports isAdmin", () => {
    const content = readContent("server/middleware/authMiddleware.js");
    expect(content).toContain("export const isAdmin");
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2b: ProtectedRoute enforces adminOnly correctly
 * Validates: Requirements 3.5
 *
 * ProtectedRoute must accept the adminOnly prop and enforce admin-only access.
 * The adminOnly check must redirect non-admins to /dashboard.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2b: ProtectedRoute enforces adminOnly correctly (Req 3.5)", () => {
  it("ProtectedRoute.jsx file exists", () => {
    expect(exists("client/src/components/ProtectedRoute.jsx")).toBe(true);
  });

  it("ProtectedRoute.jsx contains adminOnly parameter", () => {
    const content = readContent("client/src/components/ProtectedRoute.jsx");
    expect(content).toContain("adminOnly");
  });

  it("ProtectedRoute.jsx enforces admin role check (redirects non-admins)", () => {
    const content = readContent("client/src/components/ProtectedRoute.jsx");
    // Must check adminOnly AND user role === "admin"
    expect(content).toContain("adminOnly");
    expect(content).toContain('"admin"');
  });

  it("ProtectedRoute.jsx redirects unauthenticated users to /login", () => {
    const content = readContent("client/src/components/ProtectedRoute.jsx");
    expect(content).toContain("/login");
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2c: Non-hospital server models exist and are intact
 * Validates: Requirements 3.6, 3.7
 *
 * The non-hospital models must exist on disk and be unaffected by the removal.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2c: Non-hospital server models exist and are intact (Req 3.6, 3.7)", () => {
  const nonHospitalModels = [
    "server/models/Alert.js",
    "server/models/BloodRequest.js",
    "server/models/BloodInventory.js",
    "server/models/Camp.js",
    "server/models/CampRegistration.js",
    "server/models/Donor.js",
    "server/models/User.js",
    "server/models/Donation.js",
    "server/models/Certificate.js",
  ];

  for (const modelPath of nonHospitalModels) {
    it(`${modelPath} exists`, () => {
      expect(exists(modelPath), `${modelPath} should exist`).toBe(true);
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2d: Non-hospital route files exist
 * Validates: Requirements 3.3
 *
 * All non-hospital route files must exist in server/routes/.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2d: Non-hospital route files exist in server/routes/ (Req 3.3)", () => {
  const nonHospitalRoutes = [
    "server/routes/authRoutes.js",
    "server/routes/donorRoutes.js",
    "server/routes/adminRoutes.js",
    "server/routes/bloodRoutes.js",
    "server/routes/campRoutes.js",
    "server/routes/alertRoutes.js",
    "server/routes/requestRoutes.js",
    "server/routes/userRoutes.js",
  ];

  for (const routePath of nonHospitalRoutes) {
    it(`${routePath} exists`, () => {
      expect(exists(routePath), `${routePath} should exist`).toBe(true);
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2e: App.jsx contains admin and user routes
 * Validates: Requirements 3.1, 3.2
 *
 * App.jsx must contain the admin and user route paths that must be preserved.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2e: App.jsx contains admin and user routes (Req 3.1, 3.2)", () => {
  it("App.jsx file exists", () => {
    expect(exists("client/src/App.jsx")).toBe(true);
  });

  it("App.jsx contains /admin route", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain('path="/admin"');
  });

  it("App.jsx contains /dashboard route", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain('path="/dashboard"');
  });

  it("App.jsx contains /donor route", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain('path="/donor"');
  });

  it("App.jsx contains /alerts route", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain('path="/alerts"');
  });

  it("App.jsx contains /camps route", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain('path="/camps"');
  });

  it("App.jsx contains adminOnly={true} for admin route", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain("adminOnly={true}");
  });

  it("App.jsx imports AdminLayout", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain("AdminLayout");
  });

  it("App.jsx imports AdminDashboard", () => {
    const content = readContent("client/src/App.jsx");
    expect(content).toContain("AdminDashboard");
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2f: Alert model's hospital field is a plain String (not a DB reference)
 * Validates: Requirements 3.6
 *
 * The Alert model's hospital field must be type: String, not a mongoose ObjectId
 * reference to the Hospital model. This ensures it is unaffected by hospital removal.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2f: Alert model hospital field is a plain String (Req 3.6)", () => {
  it("Alert.js file exists", () => {
    expect(exists("server/models/Alert.js")).toBe(true);
  });

  it("Alert model hospital field is type String (not a DB reference)", () => {
    const content = readContent("server/models/Alert.js");
    // The hospital field block should contain "type:String" or "type: String"
    // and must NOT reference mongoose.Schema.Types.ObjectId for the hospital field
    expect(content).toContain("hospital");

    // Extract the hospital field definition — look for the pattern
    // hospital:{ type:String ... } or hospital: { type: String ... }
    // We verify it contains String type near the hospital field
    const hospitalFieldMatch = content.match(/hospital\s*:\s*\{[^}]+\}/);
    expect(hospitalFieldMatch).not.toBeNull();

    const hospitalFieldDef = hospitalFieldMatch[0];
    expect(hospitalFieldDef).toContain("String");
    // Must NOT be an ObjectId reference
    expect(hospitalFieldDef).not.toContain("ObjectId");
    expect(hospitalFieldDef).not.toContain("ref");
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2g: BloodRequest model's hospital field is a plain String (not a DB reference)
 * Validates: Requirements 3.7
 *
 * The BloodRequest model's hospital field must be type: String, not a mongoose
 * ObjectId reference to the Hospital model.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2g: BloodRequest model hospital field is a plain String (Req 3.7)", () => {
  it("BloodRequest.js file exists", () => {
    expect(exists("server/models/BloodRequest.js")).toBe(true);
  });

  it("BloodRequest model hospital field is type String (not a DB reference)", () => {
    const content = readContent("server/models/BloodRequest.js");
    expect(content).toContain("hospital");

    const hospitalFieldMatch = content.match(/hospital\s*:\s*\{[^}]+\}/);
    expect(hospitalFieldMatch).not.toBeNull();

    const hospitalFieldDef = hospitalFieldMatch[0];
    expect(hospitalFieldDef).toContain("String");
    // Must NOT be an ObjectId reference
    expect(hospitalFieldDef).not.toContain("ObjectId");
    expect(hospitalFieldDef).not.toContain("ref");
  });
});
