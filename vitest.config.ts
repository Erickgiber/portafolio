import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.svelte.ts"],
    environment: "happy-dom",
  },
});
