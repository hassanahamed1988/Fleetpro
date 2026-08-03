import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Set base to "/" for a custom domain, or "/repo-name/" for GitHub Pages
  // sub-path deployment. Override via the VITE_BASE_URL env variable in CI.
  base: process.env.VITE_BASE_URL ?? "/",

  build: {
    outDir: "dist",
    sourcemap: true,          // keep source maps for easier debugging
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libs into a separate chunk so they can be cached
        manualChunks: {
          react:  ["react", "react-dom"],
          lucide: ["lucide-react"],
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});
