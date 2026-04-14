import express from "express";
import { getInventory, addStock, dispenseStock, getTransactions, deleteStock } from "../controllers/bloodController.js";
import { getThresholds, updateThreshold } from "../controllers/thresholdController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET INVENTORY
router.get("/inventory", getInventory);

// ADD STOCK (IN)
router.post("/inventory/add", addStock);

// DISPENSE STOCK (OUT)
router.post("/inventory/dispense", dispenseStock);

// GET TRANSACTION HISTORY
router.get("/transactions", getTransactions);

// DELETE STOCK ENTRY
router.delete("/inventory/:id", deleteStock);

// THRESHOLD CONFIGURATION
router.get("/thresholds", verifyToken, isAdmin, getThresholds);
router.patch("/thresholds/:bloodGroup", verifyToken, isAdmin, updateThreshold);

export default router;
