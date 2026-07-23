import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config.js";

const CART_CREATE_MUTATION = `
  mutation CreateSafarnamaCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function shopifyEndpoint() {
  const { storeDomain, apiVersion, storefrontToken } = config.shopify;
  if (!storeDomain || !storefrontToken) {
    throw new Error("Missing Shopify Storefront credentials. Check Vercel environment variables.");
  }
  return `https://${storeDomain}/api/${apiVersion}/graphql.json`;
}

async function storefrontRequest(query, variables = {}) {
  const response = await fetch(shopifyEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.shopify.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseText = await response.text();
  const payload = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    const message = payload?.errors?.map?.((error) => error.message).join("; ")
      || payload?.error_description
      || payload?.error
      || responseText
      || response.statusText;
    throw new Error(`Shopify request failed with ${response.status}: ${message}`);
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  return payload.data;
}

function cartLineAttributes(item, appCartId, appOrderId) {
  const base = [
    { key: "app_cart_id", value: appCartId },
    { key: "app_order_id", value: appOrderId },
    { key: "Product", value: item.name },
    { key: "Selected size", value: item.details?.size },
    { key: "Selected pages", value: item.details?.pages ? `${item.details.pages} pages` : "" },
    { key: "Selected cover", value: item.details?.cover },
    { key: "Selected paper", value: item.details?.paper },
    { key: "Variant", value: item.variantTitle },
    { key: "Album design", value: item.albumDesign?.isComplete ? "Complete" : "" },
    { key: "Album spreads", value: item.albumDesign?.spreadCount },
    { key: "Album pages", value: item.albumDesign?.pageCount },
    { key: "Design service", value: item.professionalDesignRequest?.requested ? "Professional team design requested" : "" },
    { key: "Uploaded assets", value: item.professionalDesignRequest?.assets?.length },
  ];

  return base.filter((attribute) => attribute.value).map((attribute) => ({
    key: attribute.key,
    value: String(attribute.value),
  }));
}

export async function createShopifyCart({ items, appCartId, appOrderId }) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("No checkout items were provided.");
  }

  const lines = items.map((item) => {
    if (!item.variantId) {
      throw new Error(`${item.name || "A cart item"} is missing a Shopify variant ID.`);
    }

    return {
      merchandiseId: item.variantId,
      quantity: Number(item.quantity || item.qty || 1),
      attributes: cartLineAttributes(item, appCartId, appOrderId),
    };
  });

  const data = await storefrontRequest(CART_CREATE_MUTATION, {
    input: {
      lines,
      attributes: [
        { key: "app_cart_id", value: appCartId },
        { key: "app_order_id", value: appOrderId },
        { key: "Source", value: "Safarnama Vercel checkout" },
      ],
    },
  });

  const userErrors = data?.cartCreate?.userErrors || [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }

  const cart = data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) {
    throw new Error("Shopify did not return a checkout URL.");
  }

  return cart;
}

export function verifyShopifyWebhook(rawBody, hmacHeader) {
  if (!config.shopify.webhookSecret) {
    return { ok: true, skipped: true };
  }

  if (!hmacHeader) {
    return { ok: false, reason: "Missing Shopify HMAC header." };
  }

  const digest = createHmac("sha256", config.shopify.webhookSecret)
    .update(rawBody)
    .digest("base64");

  const expected = Buffer.from(digest, "utf8");
  const actual = Buffer.from(hmacHeader, "utf8");
  const ok = expected.length === actual.length && timingSafeEqual(expected, actual);

  return { ok, reason: ok ? "" : "Invalid Shopify HMAC signature." };
}
