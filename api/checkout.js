import { randomUUID } from "node:crypto";
import { handleOptions, readJsonBody, requireMethod, sendJson } from "../serverless/http.js";
import { createShopifyCart } from "../serverless/shopify.js";
import { store } from "../serverless/supabase.js";

function createSafarnamaOrderId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 10);
  return `sf-${date}-${suffix}`;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, "POST")) return;

  try {
    const body = await readJsonBody(req);
    const items = body.items || [];
    const appCartId = body.appCartId || randomUUID();
    const appOrderId = body.appOrderId || createSafarnamaOrderId();

    const cart = await createShopifyCart({ items, appCartId, appOrderId });

    const record = {
      appCartId,
      appOrderId,
      shopifyCartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      status: "checkout_created",
      items,
      metadata: {
        source: "vercel",
        albumDesignCount: items.filter((item) => item.albumDesign).length,
      },
      createdAt: new Date().toISOString(),
    };

    await store.saveCheckout(record);
    await store.saveAlbumDesignsForCheckout(items, appCartId);

    sendJson(res, 200, {
      appCartId,
      appOrderId,
      checkoutUrl: cart.checkoutUrl,
      shopifyCartId: cart.id,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
}
