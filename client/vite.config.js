import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   port: 3000, // 5173 → 3000
  //   host: true, // external link/live link এর জন্য দরকার
  // },
});
