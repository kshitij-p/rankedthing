import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";
import { loadEnvConfig } from "@next/env";

export default defineConfig(() => {
  loadEnvConfig(process.cwd());

  return {
    test: {
      globals: true,
      exclude: [...configDefaults.exclude, "**/playwright/**"],
      alias: {
        "~/": fileURLToPath(new URL("./src/", import.meta.url)),
      },
    },
  };
});
