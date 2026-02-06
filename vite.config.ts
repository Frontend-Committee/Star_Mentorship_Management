import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api-sessions": {
        target: "https://attendanceapp.pythonanywhere.com/api",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-sessions/, ""),
      },
      "/api": {
        target: "https://starunion.pythonanywhere.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase the chunk size warning limit to 2000 KB (2 MB)
    chunkSizeWarningLimit: 2000,
  },
}));
