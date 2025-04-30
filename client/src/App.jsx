import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaUpload, FaMoon, FaSun, FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:5000/api/videos";

function Home() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [_, setPlayingId] = useState(null);
  const videoRefs = useRef({});
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchVideos = () => {
    axios
      .get(BASE_URL)
      .then((res) => setVideos(res.data))
      .catch(() => toast.error("Failed to fetch videos"));
  };

  const handleUpload = async () => {
    if (!title || !videoFile) {
      toast.error("Please provide a title and select a video file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("video", videoFile);
      await axios.post(`${BASE_URL}/upload`, formData);

      toast.success("Video uploaded successfully!");
      setTitle("");
      setVideoFile(null);
      fetchVideos();
    } catch {
      toast.error("Failed to upload video.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      toast.success("Video deleted successfully!");
      fetchVideos();
    } catch {
      toast.error("Failed to delete video.");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${BASE_URL}/${editId}`, {
        title: editTitle,
      });
      toast.success("Video title updated!");
      setEditId(null);
      setEditTitle("");
      setEditModalOpen(false);
      fetchVideos();
    } catch {
      toast.error("Failed to update title.");
    }
  };

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">
            🎥 StreamVerse
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white dark:bg-gray-700 p-3 dark:hover:bg-gray-600 cursor-pointer shadow rounded-full hover:scale-105 transition"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-800" />
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mb-10 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-6">Upload New Video</h2>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Enter video title"
              className="p-3 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <label
                htmlFor="fileInput"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer"
              >
                <FaUpload /> {videoFile ? "Change Video" : "Select Video"}
              </label>
              <input
                id="fileInput"
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              {videoFile && (
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[250px]">
                  {videoFile.name}
                </p>
              )}
              <button
                onClick={handleUpload}
                className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={uploading}
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <FaUpload /> Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <input
            type="search"
            placeholder="Search videos..."
            className="w-full sm:w-1/2 py-3 px-4 mb-8 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((vid) => (
              <div
                key={vid._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <video
                  controls
                  className="w-full h-auto rounded-t-xl"
                  ref={(el) => (videoRefs.current[vid._id] = el)}
                  onPlay={() => {
                    setPlayingId(vid._id);
                    Object.entries(videoRefs.current).forEach(([id, video]) => {
                      if (id !== vid._id && video && !video.paused)
                        video.pause();
                    });
                  }}
                >
                  <source
                    src={`${BASE_URL}/stream/${vid.filename}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <div className="p-5">
                  <h3 className="text-lg font-semibold truncate mb-2">
                    {vid.title}
                  </h3>
                  <small className="text-gray-500 dark:text-gray-400 block mb-3">
                    Uploaded on{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {new Date(
                        vid.uploadedAt || vid.createdAt || Date.now()
                      ).toLocaleString()}
                    </span>
                  </small>
                  <div className="flex justify-end gap-4 text-lg">
                    <button
                      onClick={() => {
                        setEditId(vid._id);
                        setEditTitle(vid.title);
                        setEditModalOpen(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-500"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(vid._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-red-600 dark:text-red-400 font-semibold text-center col-span-full">
              No Videos Found...
            </div>
          )}
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Video Title</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white mb-4"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
