import express from "express";
import { getAssets, addAsset, updateAsset, deleteAsset } from "../controllers/assetsController.js";

const router = express.Router();

router.get("/", getAssets);
router.post("/", addAsset);
router.put("/:id", updateAsset);
router.delete("/:id", deleteAsset);

export default router;
