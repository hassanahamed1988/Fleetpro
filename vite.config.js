import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Capacitor/APK-এর জন্য relative path জরুরি
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
