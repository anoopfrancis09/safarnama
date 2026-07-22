import { handleOptions, readRawBody, requireMethod, sendJson } from "../serverless/http.js";
import { DEFAULT_BUCKET, createSignedReadUrl, uploadObject } from "../serverless/storage.js";
import { store } from "../serverless/supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function headerValue(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "POST")) return;

  try {
    const bucket = headerValue(req, "x-storage-bucket") || DEFAULT_BUCKET;
    const path = headerValue(req, "x-storage-path");
    const fileName = headerValue(req, "x-file-name") || path?.split("/").pop();
    const contentType = headerValue(req, "content-type") || "application/octet-stream";

    if (!path) {
      sendJson(res, 400, { error: "x-storage-path is required." });
      return;
    }

    const rawBody = await readRawBody(req);
    await uploadObject({
      bucket,
      path,
      bytes: rawBody,
      contentType,
      upsert: true,
    });

    await store.saveAlbumAssets({
      bucket,
      storagePath: path,
      fileName,
      contentType,
      size: rawBody.length,
    });

    const preview = await createSignedReadUrl({ bucket, path });
    sendJson(res, 200, {
      bucket,
      path,
      signedUrl: preview.signedUrl,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}

