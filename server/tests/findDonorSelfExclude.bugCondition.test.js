/**
 * Bug Condition Exploration Test
 * Property 1: Own Donor Profile Appears in Authenticated Search Results
 *
 * Validates: Requirements 1.1, 1.2
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists — the user's own donor card IS returned.
 * This test encodes the EXPECTED (correct) behavior and will pass after the fix.
 *
 * Bug Condition (isBugCondition):
 *   X.requestingUserId IS NOT NULL
 *   AND EXISTS donor WHERE donor.user = X.requestingUserId
 *                      AND donor.bloodGroup = X.bloodGroup
 *
 * Counterexample documented:
 *   searchDonors("A+", userId) returns the user's own donor record
 *   — the response array contains a donor whose `user` field equals the seeded user's ID
 */

import { describe, it, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
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

describe("Bug Condition: Own donor profile appears in authenticated search results", () => {
  /**
   * Property 1 — Bug Condition Exploration
   *
   * Validates: Requirements 1.1, 1.2
   *
   * isBugCondition holds when:
   *   - requestingUserId is not null
   *   - a donor exists with donor.user === requestingUserId
   *   - donor.bloodGroup === searched bloodGroup
   *
   * Expected (correct) behavior: own donor record is NOT in results.
   * On UNFIXED code: own donor record IS in results → assertion FAILS → bug confirmed.
   */
  it("should NOT return the authenticated user's own donor profile in search results (Property 1)", async () => {
    // --- Seed: User with bloodGroup A+ ---
    const hashedPassword = await bcrypt.hash("password123", 10);
    const seededUser = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password: hashedPassword,
      bloodGroup: "A+",
      role: "user",
    });

    // --- Seed: Donor linked to seededUser with bloodGroup A+ ---
    await Donor.create({
      user: seededUser._id,
      name: "Test User",
      email: "testuser@example.com",
      bloodGroup: "A+",
      city: "TestCity",
      mobile: "9999999999",
      availability: true,
    });

    // --- Generate JWT token for seededUser ---
    const token = jwt.sign(
      { id: seededUser._id.toString(), role: "user" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // --- Call GET /api/donor/search/A%2B with Authorization header ---
    const res = await request(app)
      .get("/api/donor/search/A%2B")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // --- Assert: own donor record is NOT in results (expected/correct behavior) ---
    // On UNFIXED code this assertion FAILS — the user's own donor IS present.
    // Counterexample: searchDonors("A+", seededUser._id) returns the user's own donor record.
    const ownDonorInResults = res.body.some(
      (donor) =>
        donor.user &&
        (donor.user._id?.toString() === seededUser._id.toString() ||
          donor.user?.toString() === seededUser._id.toString())
    );

    expect(ownDonorInResults).toBe(false);
  });
});
