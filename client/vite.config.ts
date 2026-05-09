import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), mkcert(), tailwindcss()],
   server: {
      port: 3000,
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   },
});
