import { randomUUID } from "node:crypto";
import { readRawBody, sendJson } from "./http.js";
import { mapShopifyOrder } from "./orderMapper.js";
import { verifyShopifyWebhook } from "./shopify.js";
import { store } from "./supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function handleOrderWebhook(req, res, topicFromPath) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: `Method ${req.method} is not allowed.` });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const hmac = req.headers["x-shopify-hmac-sha256"];
    const verification = verifyShopifyWebhook(rawBody, hmac);

    if (!verification.ok) {
      sendJson(res, 401, { error: verification.reason });
      return;
    }

    const webhookId = req.headers["x-shopify-webhook-id"] || randomUUID();
    if (await store.hasWebhookEvent(webhookId)) {
      sendJson(res, 200, { ok: true, duplicate: true });
      return;
    }

    const topic = req.headers["x-shopify-topic"] || topicFromPath;
    const payload = JSON.parse(rawBody.toString("utf8"));
    const order = mapShopifyOrder(payload, topic);

    await store.saveWebhookEvent({
      webhookId,
      topic,
      receivedAt: new Date().toISOString(),
      appCartId: order.appCartId,
      appOrderId: order.appOrderId,
      payload,
    });
    await store.saveOrder(order);

    if (order.appCartId) {
      await store.updateCheckout(order.appCartId, {
        status: topic === "orders/paid" ? "paid" : "order_created",
        appOrderId: order.appOrderId,
        shopifyOrderId: order.shopifyOrderId,
        orderName: order.orderName,
      });
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}
