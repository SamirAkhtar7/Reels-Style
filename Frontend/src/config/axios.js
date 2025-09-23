import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || ""; // '' => uses same origin (Vite proxy)
const instance = axios.create({
  baseURL,
  withCredentials: true, // send cookies
  timeout: 10000,
});

export default instance;
