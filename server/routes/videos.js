import express from "express";
import multer from "multer";
import {
  uploadVideo,
  getVideos,
  streamVideo,
  updateVideoTitle,
  deleteVideo,
} from "../controllers/videoController.js";
import { validateVideo } from "../middlewares/validateVideo.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload
router.post("/upload", upload.single("video"), validateVideo, uploadVideo);

// Get all
router.get("/", getVideos);

// Stream
router.get("/stream/:filename", streamVideo);

// Update title
router.put("/:id", updateVideoTitle);

// Delete video
router.delete("/:id", deleteVideo);

export default router;
