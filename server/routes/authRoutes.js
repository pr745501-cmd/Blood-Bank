import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      bloodGroup,
      phone // ✅ added
    });

    await user.save();

    res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        phone: user.phone,          // ✅ added
        city: user.city,
        role: user.role,
        donations: user.donations
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        phone: user.phone,          // ✅ FIXED
        city: user.city,
        role: user.role,
        donations: user.donations
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/* ================= USER PROFILE ================= */

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/* ================= ADMIN DASHBOARD ================= */

router.get("/admin", verifyToken, isAdmin, async (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard"
  });
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        bloodGroup: req.body.bloodGroup,
        dob: req.body.dob,
        lastDonation: req.body.lastDonation, // ✅ IMPORTANT
        gender: req.body.gender,
        address: req.body.address,
        emergencyContact: req.body.emergencyContact,
        emergencyName: req.body.emergencyName,
        allergies: req.body.allergies,
        medications: req.body.medications,
        conditions: req.body.conditions,
        surgery: req.body.surgery,
      },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;