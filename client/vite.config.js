import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // expose on all network interfaces (0.0.0.0)
    port: 5173,
    allowedHosts: true, // Allow custom local domains like app.subhancare.com
    proxy: {
      // Proxy /api requests to the Express server during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});

