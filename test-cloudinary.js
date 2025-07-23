const { uploadOnCloudinary } = require("./utils/cloudinary.js");

const path = "./public/temp/sample.jpg"; // or use any image from your `public/temp`

uploadOnCloudinary(path)
  .then((res) => {
    console.log("✅ Uploaded Successfully:", res);
  })
  .catch((err) => {
    console.error("❌ Upload Failed:", err);
  });