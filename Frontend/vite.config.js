import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // forward /api/* to backend running on port 3000
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: false,
      },
    },
  },
});
