import express from "express";
import {
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  getSummary,
} from "../controllers/assetsController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validate,
  assetSchema,
  assetUpdateSchema,
} from "../middleware/validateMiddleware.js";

const router = express.Router();

// Apply auth protection to all asset routes
router.use(protect);

router.get("/", getAssets);
router.get("/summary", getSummary);
router.post("/", validate(assetSchema), addAsset);
router.put("/:id", validate(assetUpdateSchema), updateAsset);
router.delete("/:id", deleteAsset);

export default router;
