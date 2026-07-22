function findAttribute(attributes = [], wantedKey) {
  const match = attributes.find((attribute) => {
    const key = attribute.key || attribute.name;
    return String(key || "").toLowerCase() === wantedKey.toLowerCase();
  });
  return match?.value ? String(match.value) : "";
}

function normalizeLineItem(lineItem) {
  const properties = lineItem.properties || lineItem.customAttributes || [];
  return {
    id: lineItem.id,
    productId: lineItem.product_id || lineItem.productId,
    variantId: lineItem.variant_id || lineItem.variantId,
    title: lineItem.title || lineItem.name,
    variantTitle: lineItem.variant_title || lineItem.variantTitle,
    quantity: lineItem.quantity,
    price: lineItem.price,
    properties,
  };
}

export function mapShopifyOrder(payload, topic) {
  const noteAttributes = payload.note_attributes || payload.noteAttributes || [];
  const lineItems = (payload.line_items || payload.lineItems || []).map(normalizeLineItem);
  const appCartId = findAttribute(noteAttributes, "app_cart_id")
    || lineItems.map((lineItem) => findAttribute(lineItem.properties, "app_cart_id")).find(Boolean)
    || "";
  const appOrderId = findAttribute(noteAttributes, "app_order_id")
    || lineItems.map((lineItem) => findAttribute(lineItem.properties, "app_order_id")).find(Boolean)
    || "";

  return {
    appCartId,
    appOrderId,
    topic,
    shopifyOrderId: String(payload.admin_graphql_api_id || payload.id),
    shopifyNumericOrderId: payload.id,
    orderName: payload.name,
    orderNumber: payload.order_number || payload.orderNumber,
    email: payload.email || payload.contact_email || payload.contactEmail,
    financialStatus: payload.financial_status || payload.displayFinancialStatus,
    currency: payload.currency || payload.presentment_currency,
    totalPrice: payload.total_price || payload.current_total_price,
    subtotalPrice: payload.subtotal_price || payload.current_subtotal_price,
    createdAt: payload.created_at || payload.createdAt || new Date().toISOString(),
    processedAt: payload.processed_at || payload.processedAt,
    noteAttributes,
    lineItems,
    raw: payload,
  };
}
