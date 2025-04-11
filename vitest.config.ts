import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom", // Use jsdom for React testing
    globals: true, // Enable global `expect` and other Vitest globals
  },
})
