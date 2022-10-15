import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  server: {
    port: 3300,
    host: true
  },
  plugins: [
    glsl(),
    // input https://www.npmjs.com/package/html-minifier-terser options
    ViteMinifyPlugin({})
  ]
});
