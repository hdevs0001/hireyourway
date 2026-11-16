import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["embedding/index.tsx"],
  format: ["iife"],
  globalName: "HireYourWayWidget",
  platform: "browser",
  target: "es2020",
  bundle: true,
  minify: true,
  splitting: false,
  outDir: "public",
  clean: false,

  define: {
    "import.meta.env.VITE_HIRE_YOUR_WAY": JSON.stringify(
      process.env.NEXT_PUBLIC_HIRE_YOUR_WAY || "http://localhost:3000"
    ),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});