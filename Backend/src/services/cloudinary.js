const cloudinary = require("cloudinary").v2;
const path = require("path");

function configureCloudinary() {
  const cfg = {
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
  };
  // only configure if all three present
  if (cfg.cloud_name && cfg.api_key && cfg.api_secret) {
    cloudinary.config(cfg);
    return true;
  }
  return false;
}

const hasCreds = configureCloudinary();

async function uploadOnCloudinary(filePath, filename) {
  // if no creds -> return local uploads URL
  if (!hasCreds) {
    const fname = filename || path.basename(filePath);
    return `/uploads/${fname}`;
  }

  try {
    const res = await cloudinary.uploader.upload(filePath, { folder: "shops" });
    return res.secure_url || res.url;
  } catch (err) {
    console.error(
      "Cloudinary upload failed:",
      err && err.message ? err.message : err
    );
    // fallback to local uploads path if upload fails
    const fname = filename || path.basename(filePath);
    return `/uploads/${fname}`;
  }
}

// add this helper to support memory-buffer uploads (stream)
async function uploadBufferToCloudinary(buffer, filename) {
  if (!hasCreds) {
    const fname = filename || `upload-${Date.now()}.bin`;
    return `/uploads/${fname}`;
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shops",
        public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url || result.url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = {
  uploadOnCloudinary,
  configureCloudinary,
  uploadBufferToCloudinary,
};
