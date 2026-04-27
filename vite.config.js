import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** Read KEY=value from a dotenv-style file (first match). */
function readKeyFromEnvFile(filePath, key) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const re = new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`, "im");
    const m = text.match(re);
    if (!m) return null;
    return String(m[1])
      .split("#")[0]
      .trim()
      .replace(/^["']|["']$/g, "")
      .trim();
  } catch {
    return null;
  }
}

function readKeyFromBackendEnv(key) {
  return readKeyFromEnvFile(path.join(process.cwd(), "backend", ".env"), key);
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root, "");
  // Never use generic `env.PORT` for the proxy — it often differs from the API (e.g. deploy vs local API).
  // Order: explicit Vite → backend/.env (same file as `npm start`) → root API_PORT → default.
  const apiPort =
    env.VITE_DEV_API_PORT ||
    readKeyFromBackendEnv("PORT") ||
    env.API_PORT ||
    readKeyFromEnvFile(path.join(root, ".env.local"), "VITE_DEV_API_PORT") ||
    readKeyFromEnvFile(path.join(root, ".env.local"), "API_PORT") ||
    readKeyFromEnvFile(path.join(root, ".env"), "API_PORT") ||
    env.PORT ||
    "4000";

  if (mode === "development") {
    process.stdout.write(`[vite] proxy /api → http://127.0.0.1:${apiPort}\n`);
  }

  const devApiOrigin = mode === "development" ? `http://127.0.0.1:${apiPort}` : "";

  return {
    define: {
      // Client `apiRequest` uses this in dev to hit the API directly (same port as proxy). Avoids HTML responses when the proxy target is wrong.
      __UNIONHUB_DEV_API_ORIGIN__: JSON.stringify(devApiOrigin),
    },
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
