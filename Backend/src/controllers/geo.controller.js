// ...existing code...
const axios = require("axios");

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon required" });
    }

    const apiKey =
      process.env.GEOAPIFY_API_KEY || process.env.VITE_GEOAPIKEY || "";
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Geoapify API key not configured on server" });
    }

    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&apiKey=${encodeURIComponent(apiKey)}`;

    const resp = await axios.get(url, { timeout: 5000 });
    return res.status(resp.status || 200).json(resp.data);
  } catch (err) {
    console.error("Geo reverse proxy error:", err?.message || err);
    if (err.response) {
      // Forward status and data from Geoapify when available
      return res
        .status(err.response.status || 500)
        .json(err.response.data || { message: "Geoapify error" });
        
    }
    return res
      .status(500)
      .json({ message: `Geo proxy error ${err.message || err}` });
  }
};


