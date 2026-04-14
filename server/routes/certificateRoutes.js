import express from "express";
import Certificate from "../models/Certificate.js";
import {
  createCertificate,
  getUserCertificates,
  getAllCertificates,
  deleteCertificate
} from "../controllers/certificateController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN CREATE CERTIFICATE ================= */
router.post("/create", verifyToken, createCertificate);

/* ================= USER VIEW OWN CERTIFICATES ================= */
router.get("/my", verifyToken, getUserCertificates);

/* ================= ADMIN VIEW ALL CERTIFICATES ================= */
router.get("/all", verifyToken, getAllCertificates);

/* ================= ADMIN DELETE CERTIFICATE ================= */
router.delete("/delete/:id", verifyToken, deleteCertificate);

/* ================= VERIFY CERTIFICATE ================= */
router.get("/verify/:id", async (req, res) => {
  const cert = await Certificate.findOne({
    certificateId: req.params.id
  });

  if (!cert) {
    return res.status(404).json({ message: "Invalid certificate" });
  }

  res.json(cert);
});

export default router;