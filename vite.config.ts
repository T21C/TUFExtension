import { resolve } from "node:path";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import manifest from "./manifest.config";

export default defineConfig({
  resolve: {
    alias: {
      "@domain": resolve(__dirname, "src/domain"),
      "@drawer": resolve(__dirname, "src/drawer"),
      "@entrypoints": resolve(__dirname, "src/entrypoints"),
      "@features": resolve(__dirname, "src/features"),
      "@platform": resolve(__dirname, "src/platform"),
      "@shared": resolve(__dirname, "src/shared")
    }
  },
  plugins: [react(), tailwindcss(), crx({ manifest })],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//]
    }
  },
  build: {
    emptyOutDir: true,
    outDir: "dist",
    sourcemap: false
  }
});
