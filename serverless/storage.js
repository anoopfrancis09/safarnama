import { config, requireSupabaseConfig } from "./config.js";

export const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "album-photos";

function encodeStoragePath(path) {
  return String(path)
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function storageBaseUrl() {
  requireSupabaseConfig();
  return `${config.supabase.url.replace(/\/$/, "")}/storage/v1`;
}

function absoluteStorageUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${storageBaseUrl()}${value.startsWith("/") ? value : `/${value}`}`;
}

async function storageRequest(endpoint, { method = "GET", body, headers = {} } = {}) {
  requireSupabaseConfig();

  const response = await fetch(`${storageBaseUrl()}${endpoint}`, {
    method,
    headers: {
      apikey: config.supabase.serviceRoleKey,
      Authorization: `Bearer ${config.supabase.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Supabase Storage request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function createSignedUploadUrl({ bucket = DEFAULT_BUCKET, path, upsert = true }) {
  const encodedPath = encodeStoragePath(path);
  const payload = await storageRequest(`/object/upload/sign/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: "POST",
    body: {},
    headers: upsert ? { "x-upsert": "true" } : {},
  });

  const signedValue = payload?.signedURL || payload?.signedUrl || payload?.url || payload?.signed_url;
  const token = payload?.token || "";
  const fallback = token ? `/object/upload/sign/${bucket}/${encodedPath}?token=${encodeURIComponent(token)}` : "";

  return {
    bucket,
    path,
    token,
    uploadUrl: absoluteStorageUrl(signedValue || fallback),
  };
}

export async function uploadObject({ bucket = DEFAULT_BUCKET, path, bytes, contentType = "application/octet-stream", upsert = true }) {
  requireSupabaseConfig();
  const encodedPath = encodeStoragePath(path);
  const response = await fetch(`${storageBaseUrl()}/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: config.supabase.serviceRoleKey,
      Authorization: `Bearer ${config.supabase.serviceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": String(Boolean(upsert)),
    },
    body: bytes,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || text || `Supabase Storage upload failed with ${response.status}`;
    throw new Error(message);
  }

  return {
    bucket,
    path,
    payload,
  };
}

export async function createSignedReadUrl({ bucket = DEFAULT_BUCKET, path, expiresIn = 60 * 60 * 24 * 7 }) {
  const encodedPath = encodeStoragePath(path);
  const payload = await storageRequest(`/object/sign/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: "POST",
    body: { expiresIn },
  });

  return {
    bucket,
    path,
    signedUrl: absoluteStorageUrl(payload?.signedURL || payload?.signedUrl || payload?.url || payload?.signed_url),
  };
}
