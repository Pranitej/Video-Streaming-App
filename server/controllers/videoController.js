import fs from "fs";
import path from "path";
import Video from "../models/Video.js";

export const uploadVideo = async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      filename: req.file.filename,
    });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getVideos = async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
};

export const streamVideo = (req, res) => {
  const videoPath = path.join("uploads", req.params.filename);
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(videoPath).pipe(res);
  }
};

export const updateVideoTitle = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const updated = await Video.findByIdAndUpdate(
      id,
      { title },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Video not found" });
    res.json({ message: "Title updated", video: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Delete file from uploads folder
    const filePath = path.join("uploads", video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete from DB
    await Video.findByIdAndDelete(id);

    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
