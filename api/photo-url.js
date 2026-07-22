import { getQueryParam, handleOptions, requireMethod, sendJson } from "../serverless/http.js";
import { createSignedReadUrl, DEFAULT_BUCKET } from "../serverless/storage.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "GET")) return;

  try {
    const path = getQueryParam(req, "path").trim();
    const bucket = getQueryParam(req, "bucket").trim() || DEFAULT_BUCKET;

    if (!path) {
      sendJson(res, 400, { error: "path is required." });
      return;
    }

    const result = await createSignedReadUrl({ bucket, path });
    sendJson(res, 200, result);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}

