import { handleOptions, requireMethod, sendJson } from "../serverless/http.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "GET")) return;

  sendJson(res, 200, { ok: true, storage: "supabase" });
}
