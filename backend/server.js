import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import assetRoutes from "./src/routes/assets.js";

dotenv.config();
const app = express();

// ----------- CORS FIX (IMPORTANT) -----------
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Parse JSON
app.use(express.json());

// ----------- CONNECT MONGO -----------
await connectDB();

// ----------- ROUTES -----------
app.use("/api/assets", assetRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("TrackWise backend is running!");
});

// ----------- SERVER START -----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
