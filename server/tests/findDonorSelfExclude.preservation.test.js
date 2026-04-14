/**
 * Preservation Property Tests
 * Property 2: Unauthenticated and Non-Matching Searches Return Unchanged Results
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 *
 * OBSERVATION-FIRST METHODOLOGY:
 *   - Observe: GET /api/donor/search/A%2B with NO token returns all A+ donors (baseline count N)
 *   - Observe: GET /api/donor/search/B%2B with a token for an A+ user returns all B+ donors unchanged
 *   - Observe: results are sorted available-first regardless of auth state
 *
 * EXPECTED OUTCOME: Tests PASS on UNFIXED code (confirms baseline behavior to preserve)
 *
 * These tests encode the preservation invariants that must hold both before AND after the fix.
 */

import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Donor from "../models/Donor.js";
import donorRoutes from "../routes/donorRoutes.js";

const JWT_SECRET = "bloodconnectsecret123";
const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use("/api/donor", donorRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Donor.deleteMany({});
});

/* ─────────────────────────────────────────────────────────────────────────────
 * HELPERS
 * ───────────────────────────────────────────────────────────────────────────── */

/** Seed N donors for a given blood group with alternating availability */
async function seedDonors(bloodGroup, count) {
  const donors = [];
  for (let i = 0; i < count; i++) {
    const donor = await Donor.create({
      name: `Donor ${bloodGroup} ${i}`,
      bloodGroup,
      city: "TestCity",
      mobile: `900000${bloodGroup.replace(/[^A-Z0-9]/g, "")}${i}`,
      availability: i % 2 === 0, // alternating: true, false, true, false…
    });
    donors.push(donor);
  }
  return donors;
}

/** Create a user + JWT token for a given blood group */
async function createUserWithToken(bloodGroup) {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await User.create({
    name: `User ${bloodGroup}`,
    email: `user${bloodGroup.replace(/[^A-Z0-9]/g, "").toLowerCase()}@example.com`,
    password: hashedPassword,
    bloodGroup,
    role: "user",
  });
  const token = jwt.sign({ id: user._id.toString(), role: "user" }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return { user, token };
}

/** Extract sorted donor IDs from a response body */
function extractIds(body) {
  return body.map((d) => d._id.toString());
}

/* ─────────────────────────────────────────────────────────────────────────────
 * OBSERVATION BASELINE
 * Confirm the current (unfixed) behavior we are preserving.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Observation: baseline behavior of unfixed code", () => {
  it("unauthenticated search returns all A+ donors (baseline count N)", async () => {
    await seedDonors("A+", 4);

    const res = await request(app).get("/api/donor/search/A%2B");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Baseline: all 4 donors returned
    expect(res.body).toHaveLength(4);
  });

  it("authenticated A+ user searching B+ gets all B+ donors unchanged", async () => {
    await seedDonors("B+", 3);
    const { token } = await createUserWithToken("A+");

    const unauthRes = await request(app).get("/api/donor/search/B%2B");
    const authRes = await request(app)
      .get("/api/donor/search/B%2B")
      .set("Authorization", `Bearer ${token}`);

    expect(authRes.status).toBe(200);
    // Mismatched blood group: result must be identical to unauthenticated result
    expect(authRes.body).toHaveLength(unauthRes.body.length);
    expect(extractIds(authRes.body)).toEqual(extractIds(unauthRes.body));
  });

  it("results are sorted available-first regardless of auth state", async () => {
    // Seed with explicit availability values
    await Donor.create({ name: "Unavailable", bloodGroup: "O+", city: "C", mobile: "111", availability: false });
    await Donor.create({ name: "Available",   bloodGroup: "O+", city: "C", mobile: "222", availability: true });

    const res = await request(app).get("/api/donor/search/O%2B");

    expect(res.status).toBe(200);
    expect(res.body[0].availability).toBe(true);
    expect(res.body[1].availability).toBe(false);
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2a: Unauthenticated search returns all matching donors
 * Validates: Requirements 3.1
 *
 * For all blood groups, unauthenticated search returns the same donor IDs
 * and count as the current unfixed code.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2a: Unauthenticated search returns all matching donors (Req 3.1)", () => {
  for (const bloodGroup of ALL_BLOOD_GROUPS) {
    it(`unauthenticated search for ${bloodGroup} returns all seeded donors`, async () => {
      const seeded = await seedDonors(bloodGroup, 3);
      const seededIds = seeded.map((d) => d._id.toString()).sort();

      const res = await request(app).get(
        `/api/donor/search/${encodeURIComponent(bloodGroup)}`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);

      const returnedIds = res.body.map((d) => d._id.toString()).sort();
      expect(returnedIds).toEqual(seededIds);
    });
  }

  it("unauthenticated search for a blood group with no donors returns empty array", async () => {
    // Seed only A+ donors, search for B-
    await seedDonors("A+", 2);

    const res = await request(app).get("/api/donor/search/B-");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2b: Mismatched blood group — result identical to unauthenticated
 * Validates: Requirements 3.2
 *
 * For all blood groups where the user's blood group differs from the searched
 * group, the result set is identical to the unauthenticated result.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2b: Mismatched blood group search is identical to unauthenticated (Req 3.2)", () => {
  /**
   * Generate pairs where userBloodGroup !== searchBloodGroup.
   * We test a representative sample across the 8 blood groups.
   */
  const mismatchedPairs = [
    { userGroup: "A+", searchGroup: "B+" },
    { userGroup: "A+", searchGroup: "O-" },
    { userGroup: "B-", searchGroup: "A+" },
    { userGroup: "O+", searchGroup: "AB+" },
    { userGroup: "AB-", searchGroup: "O+" },
    { userGroup: "O-", searchGroup: "B-" },
  ];

  for (const { userGroup, searchGroup } of mismatchedPairs) {
    it(`user with ${userGroup} searching ${searchGroup} gets same result as unauthenticated`, async () => {
      await seedDonors(searchGroup, 3);
      const { token } = await createUserWithToken(userGroup);

      const unauthRes = await request(app).get(
        `/api/donor/search/${encodeURIComponent(searchGroup)}`
      );
      const authRes = await request(app)
        .get(`/api/donor/search/${encodeURIComponent(searchGroup)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(authRes.status).toBe(200);
      expect(authRes.body).toHaveLength(unauthRes.body.length);
      expect(extractIds(authRes.body)).toEqual(extractIds(unauthRes.body));
    });
  }

  it("mismatched search with empty result set returns empty array (Req 3.3 — No Donors Found)", async () => {
    // No donors seeded for AB-
    const { token } = await createUserWithToken("A+");

    const res = await request(app)
      .get("/api/donor/search/AB-")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PROPERTY 2c: Sort preservation — available donors always appear first
 * Validates: Requirements 3.4
 *
 * For any result array, available donors always appear before unavailable ones.
 * This must hold regardless of auth state.
 * ───────────────────────────────────────────────────────────────────────────── */

describe("Property 2c: Sort preservation — available donors appear first (Req 3.4)", () => {
  /** Assert that the result array is sorted availability-first */
  function assertAvailabilityFirstSort(body) {
    let seenUnavailable = false;
    for (const donor of body) {
      if (!donor.availability) {
        seenUnavailable = true;
      }
      if (seenUnavailable && donor.availability) {
        throw new Error(
          "Sort violation: an available donor appears after an unavailable donor"
        );
      }
    }
  }

  it("unauthenticated search result is sorted available-first for A+", async () => {
    // Seed in reverse order: unavailable first, then available
    await Donor.create({ name: "Unavail1", bloodGroup: "A+", city: "C", mobile: "501", availability: false });
    await Donor.create({ name: "Avail1",   bloodGroup: "A+", city: "C", mobile: "502", availability: true });
    await Donor.create({ name: "Unavail2", bloodGroup: "A+", city: "C", mobile: "503", availability: false });
    await Donor.create({ name: "Avail2",   bloodGroup: "A+", city: "C", mobile: "504", availability: true });

    const res = await request(app).get("/api/donor/search/A%2B");

    expect(res.status).toBe(200);
    assertAvailabilityFirstSort(res.body);
  });

  it("authenticated mismatched-group search result is sorted available-first", async () => {
    await Donor.create({ name: "Unavail", bloodGroup: "B+", city: "C", mobile: "601", availability: false });
    await Donor.create({ name: "Avail",   bloodGroup: "B+", city: "C", mobile: "602", availability: true });

    const { token } = await createUserWithToken("A+");

    const res = await request(app)
      .get("/api/donor/search/B%2B")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    assertAvailabilityFirstSort(res.body);
  });

  it("sort is preserved across all blood groups (unauthenticated)", async () => {
    let mobileCounter = 70000;
    for (const bloodGroup of ALL_BLOOD_GROUPS) {
      // Seed 4 donors with alternating availability (unavailable first)
      await Donor.create({ name: `U1-${bloodGroup}`, bloodGroup, city: "C", mobile: `${++mobileCounter}`, availability: false });
      await Donor.create({ name: `A1-${bloodGroup}`, bloodGroup, city: "C", mobile: `${++mobileCounter}`, availability: true });
      await Donor.create({ name: `U2-${bloodGroup}`, bloodGroup, city: "C", mobile: `${++mobileCounter}`, availability: false });
      await Donor.create({ name: `A2-${bloodGroup}`, bloodGroup, city: "C", mobile: `${++mobileCounter}`, availability: true });

      const res = await request(app).get(
        `/api/donor/search/${encodeURIComponent(bloodGroup)}`
      );

      expect(res.status).toBe(200);
      assertAvailabilityFirstSort(res.body);
    }
  });

  it("single-donor result is trivially sorted (edge case)", async () => {
    await Donor.create({ name: "Solo", bloodGroup: "O-", city: "C", mobile: "800", availability: false });

    const res = await request(app).get("/api/donor/search/O-");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    assertAvailabilityFirstSort(res.body);
  });

  it("empty result is trivially sorted (edge case)", async () => {
    const res = await request(app).get("/api/donor/search/AB%2B");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
    assertAvailabilityFirstSort(res.body);
  });
});
