import { randomUUID } from "node:crypto";
import { handleOptions, readJsonBody, requireMethod, sendJson } from "../serverless/http.js";
import { createSignedUploadUrl, DEFAULT_BUCKET } from "../serverless/storage.js";
import { store } from "../serverless/supabase.js";

function cleanFileName(fileName = "photo.jpg") {
  const cleaned = String(fileName)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
  return cleaned || "photo.jpg";
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "POST")) return;

  try {
    const body = await readJsonBody(req);
    const bucket = body.bucket || DEFAULT_BUCKET;
    const datePrefix = new Date().toISOString().slice(0, 10);
    const path = body.path || `uploads/${datePrefix}/${randomUUID()}-${cleanFileName(body.fileName)}`;
    const upload = await createSignedUploadUrl({ bucket, path, upsert: true });
    await store.saveAlbumAssets({
      bucket,
      storagePath: path,
      fileName: body.fileName,
      contentType: body.contentType,
      size: body.size,
    });

    sendJson(res, 200, {
      bucket,
      path,
      uploadUrl: upload.uploadUrl,
      token: upload.token,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}
