import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build:
    mode === "widget"
      ? {
          lib: {
            entry: resolve(__dirname, "src/widget/bootstrap.ts"),
            name: "KarticleWidget",
            fileName: () => "karticle-widget.js",
            formats: ["iife"],
          },
        }
      : undefined,
  server: {
    port: 5173,
  },
}));
