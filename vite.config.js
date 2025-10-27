// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // SCSS에서도 @ 쓸 수 있게
        includePaths: [path.resolve(__dirname, "src")],
        // 모든 SCSS 파일에 자동으로 주입되는 부분
        additionalData: `
          @use "sass:map";
          @use "@/assets/scss/utils" as *;
        `,
      },
    },
  },
  server: {
    open: true,
    port: 4000,
    // 서버와의 통신을 위한 proxy 설정 > /api/user
    proxy: {
      "/api": {
        target: "http://localhost:9090",
        changeOrigin: true,
      },
    },
  },
});
