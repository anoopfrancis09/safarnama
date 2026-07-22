import { handleOptions, requireMethod, sendJson } from "../serverless/http.js";
import { store } from "../serverless/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "GET")) return;

  try {
    const assets = await store.listAlbumAssets();
    sendJson(res, 200, { assets });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}

