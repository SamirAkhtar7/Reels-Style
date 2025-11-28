import axios from "axios";

// Read API base URL injected at build time by Vite.
const rawBase = import.meta.env.VITE_API_URL || "";
// Normalize: trim trailing slashes
const baseURL = rawBase ? rawBase.replace(/\/+$/, "") : "";

if (!baseURL && import.meta.env.PROD) {
  // In production, empty baseURL likely means VITE_API_URL wasn't set at build time.
  // This causes requests to go to the frontend origin and will return 404s.
  // Log a clear error to help debugging in deployed logs.
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_API_URL in production build — API requests will target the frontend origin."
  );
}

const instance = axios.create({
  baseURL,
  withCredentials: true, // send cookies
  timeout: 10000,
});

export default instance;
