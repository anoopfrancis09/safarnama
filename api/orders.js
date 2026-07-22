import { getQueryParam, handleOptions, requireMethod, sendJson } from "../serverless/http.js";
import { store } from "../serverless/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "GET")) return;

  try {
    const appCartId = getQueryParam(req, "app_cart_id").trim();
    const orders = await store.listOrders({ appCartId });
    sendJson(res, 200, { orders });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}
