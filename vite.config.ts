import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        vitral: "vitral/index.html",
        checkout: "vitral/comprar/index.html",
        rumbo: "rumbo/index.html",
      },
    },
  },
});
