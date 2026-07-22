import { config, requireSupabaseConfig } from "./config.js";

function isoNow() {
  return new Date().toISOString();
}

function restUrl(table, query = "") {
  requireSupabaseConfig();
  const base = config.supabase.url.replace(/\/$/, "");
  return `${base}/rest/v1/${table}${query}`;
}

async function supabaseRequest(table, { method = "GET", query = "", body, headers = {} } = {}) {
  requireSupabaseConfig();

  const response = await fetch(restUrl(table, query), {
    method,
    headers: {
      apikey: config.supabase.serviceRoleKey,
      Authorization: `Bearer ${config.supabase.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.hint || payload?.details || `Supabase ${table} request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function encodeFilter(value) {
  return encodeURIComponent(String(value));
}

function toCheckoutRow(record) {
  return {
    app_cart_id: record.appCartId,
    app_order_id: record.appOrderId,
    shopify_cart_id: record.shopifyCartId || null,
    checkout_url: record.checkoutUrl || null,
    status: record.status || "checkout_created",
    items: record.items || [],
    metadata: record.metadata || {},
    created_at: record.createdAt || isoNow(),
    updated_at: record.updatedAt || null,
  };
}

function fromCheckoutRow(row) {
  if (!row) return null;
  return {
    appCartId: row.app_cart_id,
    appOrderId: row.app_order_id,
    shopifyCartId: row.shopify_cart_id,
    checkoutUrl: row.checkout_url,
    status: row.status,
    items: row.items || [],
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOrderRow(record) {
  const totalPrice = record.totalPrice === undefined || record.totalPrice === null || record.totalPrice === "" ? null : Number(record.totalPrice);
  const subtotalPrice = record.subtotalPrice === undefined || record.subtotalPrice === null || record.subtotalPrice === "" ? null : Number(record.subtotalPrice);

  return {
    shopify_order_id: record.shopifyOrderId,
    shopify_numeric_order_id: record.shopifyNumericOrderId ? String(record.shopifyNumericOrderId) : null,
    app_cart_id: record.appCartId || null,
    app_order_id: record.appOrderId || null,
    order_name: record.orderName || null,
    order_number: record.orderNumber ? String(record.orderNumber) : null,
    email: record.email || null,
    financial_status: record.financialStatus || null,
    status: record.financialStatus || record.topic || null,
    currency: record.currency || null,
    total_price: Number.isNaN(totalPrice) ? null : totalPrice,
    subtotal_price: Number.isNaN(subtotalPrice) ? null : subtotalPrice,
    payload: record.raw || record,
    created_at: record.createdAt || isoNow(),
    processed_at: record.processedAt || null,
  };
}

function fromOrderRow(row) {
  if (!row) return null;
  const payload = row.payload || {};
  return {
    ...payload,
    shopifyOrderId: row.shopify_order_id,
    shopifyNumericOrderId: row.shopify_numeric_order_id,
    appCartId: row.app_cart_id,
    appOrderId: row.app_order_id,
    orderName: row.order_name,
    orderNumber: row.order_number,
    email: row.email,
    financialStatus: row.financial_status,
    currency: row.currency,
    totalPrice: row.total_price,
    subtotalPrice: row.subtotal_price,
    createdAt: row.created_at,
    processedAt: row.processed_at,
  };
}

function toAlbumDesignRow(item, appCartId) {
  const design = item.albumDesign;
  return {
    cart_item_id: item.id,
    app_cart_id: appCartId,
    product_slug: item.slug || null,
    project_name: design.projectName || item.project || "New album",
    status: item.status || (design.isComplete ? "complete" : "draft"),
    is_complete: Boolean(design.isComplete),
    spread_count: Number(design.spreadCount || 0),
    page_count: Number(design.pageCount || 0),
    design,
    photo_library: design.photoLibrary || [],
    updated_at: isoNow(),
  };
}

function collectAlbumAssets(design, albumDesignId = null) {
  const byPath = new Map();
  const addPhoto = (photo = {}) => {
    const storagePath = photo.storagePath || photo.path;
    if (!storagePath || byPath.has(storagePath)) return;

    byPath.set(storagePath, {
      album_design_id: albumDesignId,
      bucket: photo.storageBucket || photo.bucket || "album-photos",
      storage_path: storagePath,
      file_name: photo.fileName || photo.name || null,
      mime_type: photo.contentType || photo.mimeType || null,
      size_bytes: photo.size || photo.sizeBytes || null,
      width: photo.width || null,
      height: photo.height || null,
    });
  };

  (design?.photoLibrary || []).forEach(addPhoto);
  (design?.spreads || []).forEach((spread) => {
    (spread.items || []).forEach(addPhoto);
  });

  return [...byPath.values()];
}

export const store = {
  async saveCheckout(record) {
    const rows = await supabaseRequest("checkouts", {
      method: "POST",
      query: "?select=*",
      body: toCheckoutRow(record),
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
    return fromCheckoutRow(rows?.[0]);
  },

  async saveAlbumDesignsForCheckout(items, appCartId) {
    const designItems = items.filter((item) => item.albumDesign);
    const rows = designItems
      .map((item) => toAlbumDesignRow(item, appCartId));

    if (!rows.length) return [];

    const savedDesigns = await supabaseRequest("album_designs", {
      method: "POST",
      query: "?on_conflict=cart_item_id&select=*",
      body: rows,
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });

    const assetRows = savedDesigns.flatMap((savedDesign, index) => collectAlbumAssets(designItems[index]?.albumDesign, savedDesign.id));
    if (assetRows.length) {
      await this.saveAlbumAssets(assetRows);
    }

    return savedDesigns;
  },

  async saveAlbumAssets(assets) {
    const rows = (Array.isArray(assets) ? assets : [assets])
      .filter((asset) => asset?.storage_path || asset?.storagePath)
      .map((asset) => ({
        album_design_id: asset.album_design_id || asset.albumDesignId || null,
        bucket: asset.bucket || asset.storageBucket || "album-photos",
        storage_path: asset.storage_path || asset.storagePath,
        file_name: asset.file_name || asset.fileName || asset.name || null,
        mime_type: asset.mime_type || asset.mimeType || asset.contentType || null,
        size_bytes: asset.size_bytes || asset.sizeBytes || asset.size || null,
        width: asset.width || null,
        height: asset.height || null,
      }));

    if (!rows.length) return [];

    return supabaseRequest("album_assets", {
      method: "POST",
      query: "?on_conflict=storage_path&select=*",
      body: rows,
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
  },

  async listAlbumAssets() {
    return supabaseRequest("album_assets", {
      query: "?select=*&order=created_at.desc",
    });
  },

  async updateCheckout(appCartId, patch) {
    const existing = await supabaseRequest("checkouts", {
      query: `?app_cart_id=eq.${encodeFilter(appCartId)}&select=*`,
    });
    const current = existing?.[0] || {};
    const metadata = {
      ...(current.metadata || {}),
      ...(patch.shopifyOrderId ? { shopifyOrderId: patch.shopifyOrderId } : {}),
      ...(patch.orderName ? { orderName: patch.orderName } : {}),
    };

    const rows = await supabaseRequest("checkouts", {
      method: "PATCH",
      query: `?app_cart_id=eq.${encodeFilter(appCartId)}&select=*`,
      body: {
        status: patch.status || current.status || "checkout_created",
        app_order_id: patch.appOrderId || current.app_order_id,
        metadata,
        updated_at: isoNow(),
      },
      headers: { Prefer: "return=representation" },
    });

    return fromCheckoutRow(rows?.[0]);
  },

  async hasWebhookEvent(webhookId) {
    const rows = await supabaseRequest("webhook_events", {
      query: `?webhook_id=eq.${encodeFilter(webhookId)}&select=webhook_id&limit=1`,
    });
    return Boolean(rows?.length);
  },

  async saveWebhookEvent(record) {
    const rows = await supabaseRequest("webhook_events", {
      method: "POST",
      query: "?select=*",
      body: {
        webhook_id: record.webhookId,
        topic: record.topic || null,
        app_cart_id: record.appCartId || null,
        app_order_id: record.appOrderId || null,
        received_at: record.receivedAt || isoNow(),
        payload: record.payload || {},
      },
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
    return rows?.[0];
  },

  async saveOrder(record) {
    const rows = await supabaseRequest("orders", {
      method: "POST",
      query: "?select=*",
      body: toOrderRow(record),
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
    return fromOrderRow(rows?.[0]);
  },

  async listOrders({ appCartId } = {}) {
    const filter = appCartId ? `app_cart_id=eq.${encodeFilter(appCartId)}&` : "";
    const rows = await supabaseRequest("orders", {
      query: `?${filter}select=*&order=created_at.desc`,
    });
    return (rows || []).map(fromOrderRow);
  },

  async listCheckouts() {
    const rows = await supabaseRequest("checkouts", {
      query: "?select=*&order=created_at.desc",
    });
    return (rows || []).map(fromCheckoutRow);
  },

  async findOrderStatus(appOrderId) {
    const encoded = encodeFilter(appOrderId);
    const [orders, checkouts] = await Promise.all([
      supabaseRequest("orders", {
        query: `?app_order_id=eq.${encoded}&select=*&limit=1`,
      }),
      supabaseRequest("checkouts", {
        query: `?app_order_id=eq.${encoded}&select=*&limit=1`,
      }),
    ]);

    return {
      order: fromOrderRow(orders?.[0]),
      checkout: fromCheckoutRow(checkouts?.[0]),
    };
  },
};
