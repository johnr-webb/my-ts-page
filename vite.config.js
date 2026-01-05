import { defineConfig } from "vite";

export default defineConfig({
  base: "/my-ts-page/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public",
});
