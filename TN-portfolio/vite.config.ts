import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  root: "src/", // Sources files (typically where index.html is)
  publicDir: "../public/", // Path from "root" to static assets (files that are served as they are)
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
});
