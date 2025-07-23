const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config(); 

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

// Import routes
const userRoutes = require("./routes/user.routes");
const roadmapRoutes = require("./routes/roadmap.routes");


// Use routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roadmaps", roadmapRoutes);     



app.get("/", (req, res) => {
    res.send('PathFinder API is running 🚀');
});
// Global error handler (after all routes)
app.use((err, req, res, next) => {
  console.error("❌ Error middleware caught:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large (max 2MB)" });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ message: err.message || "Internal Server Error" });
});




module.exports = app;