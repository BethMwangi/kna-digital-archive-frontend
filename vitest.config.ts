import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Deliberately separate from vite.config.ts: that file is wired to
// @lovable.dev/vite-tanstack-config (TanStack Start + Nitro SSR build), which
// isn't something Vitest needs or wants — tests run against plain jsdom.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    testTimeout: 10000,
    env: {
      VITE_API_URL: "http://localhost:8000/api/v1",
    },
  },
});
