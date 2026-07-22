import { getQueryParam, handleOptions, requireMethod, sendJson } from "../serverless/http.js";
import { store } from "../serverless/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "GET")) return;

  try {
    const appOrderId = getQueryParam(req, "app_order_id").trim();

    if (!appOrderId) {
      sendJson(res, 400, { error: "app_order_id is required." });
      return;
    }

    const result = await store.findOrderStatus(appOrderId);
    sendJson(res, 200, {
      found: Boolean(result.order || result.checkout),
      appOrderId,
      order: result.order,
      checkout: result.checkout,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}
