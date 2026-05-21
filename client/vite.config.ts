import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(async ({ command }) => {
   const plugins: PluginOption[] = [react(), tailwindcss()];

   if (command === "serve") {
      const { default: mkcert } = await import("vite-plugin-mkcert");
      plugins.push(mkcert());
   }

   return {
      plugins,
      server: {
         port: 3000,
      },
      resolve: {
         alias: {
            "@": path.resolve(__dirname, "./src"),
         },
      },
   };
});
