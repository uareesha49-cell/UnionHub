import { clearAuth } from "./authStorage";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";

/**
 * Resolves the API URL for fetch.
 * - Dev: `__UNIONHUB_DEV_API_ORIGIN__` (Vite define) matches the dev proxy target.
 * - Prod: default same-origin `/api` (Vercel rewrites to `api/index.js`). If the SPA is hosted
 *   elsewhere, set `VITE_API_ORIGIN` at build time to the API base URL (no trailing slash).
 */
export function resolveApiUrl(path) {
  const rel = path.startsWith("/api") ? path : `/api${path}`;
  if (typeof __UNIONHUB_DEV_API_ORIGIN__ !== "undefined" && __UNIONHUB_DEV_API_ORIGIN__) {
    return `${__UNIONHUB_DEV_API_ORIGIN__}${rel}`;
  }
  const prodOrigin = import.meta.env.VITE_API_ORIGIN;
  if (prodOrigin) {
    return `${String(prodOrigin).replace(/\/$/, "")}${rel}`;
  }
  return rel;
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  let res;
  try {
    res = await fetch(resolveApiUrl(path), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("unionhub_network_ok"));
    }
  } catch {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("unionhub_network_error"));
    }
    const message = "Network error. Please check your connection.";
    toast.custom((t) => <CustomToast id={t} message={message} />);
    throw new Error(message);
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (res.ok && text && data === null) {
    const message =
      "Server returned HTML instead of JSON (often a bad Vite → API port). Set VITE_DEV_API_PORT in root .env to match backend PORT (see backend/.env), then restart npm run dev and npm start.";
    toast.custom((t) => <CustomToast id={t} message={message} type="error" />);
    throw new Error(message);
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearAuth();
      const message = "Session expired. Please login again.";
      toast.custom((t) => <CustomToast id={t} message={message} />);
      throw new Error(message);
    }
    const message = data?.error || text || `Request failed (${res.status})`;
    toast.custom((t) => <CustomToast id={t} message={message} />);
    throw new Error(message);
  }

  return data;
}

/** For non-JSON responses (e.g. voucher HTML download). */
export async function apiFetchBlob(path, { method = "GET", token } = {}) {
  const res = await fetch(resolveApiUrl(path), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (res.status === 401 && token) {
      clearAuth();
    }
    const message = data?.error || text || `Request failed (${res.status})`;
    toast.custom((t) => <CustomToast id={t} message={message} type="error" />);
    throw new Error(message);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = "download";
  const m = cd && /filename="([^"]+)"/.exec(cd);
  if (m) filename = m[1];
  return { blob, filename };
}
