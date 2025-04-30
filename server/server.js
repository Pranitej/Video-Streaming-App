import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import videoRoutes from "./routes/videos.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/videos", videoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
