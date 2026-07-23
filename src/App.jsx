import React from "react";
import { StudioPage, UploadPage } from "./pages/studio/StudioPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import "./styles.css";

// ===== shared.jsx =====
// Safarnama — shared data, components, and helpers
// Loaded as type="text/babel" — exposes via window.Object.assign at the bottom

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ============ Real-feeling stock images ============
// Indian wedding / family / travel via Unsplash
const STOCK = {
  hero: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=80&auto=format&fit=crop",
  weddingCouple: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=1200&q=80&auto=format&fit=crop",
  weddingHands: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=1200&q=80&auto=format&fit=crop",
  weddingBride: "https://images.unsplash.com/photo-1610028290816-5d937a395a49?w=1200&q=80&auto=format&fit=crop",
  weddingMandap: "https://images.unsplash.com/photo-1625047509252-ab38fb5c5cda?w=1200&q=80&auto=format&fit=crop",
  weddingDance: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop",
  weddingFlowers: "https://images.unsplash.com/photo-1597157639073-69284dc0fdaf?w=1200&q=80&auto=format&fit=crop",
  weddingHenna: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80&auto=format&fit=crop",
  family: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&q=80&auto=format&fit=crop",
  travel: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80&auto=format&fit=crop",
  travelTaj: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=1200&q=80&auto=format&fit=crop",
  craft: "https://images.unsplash.com/photo-1606293459209-f9a45d2049a6?w=1200&q=80&auto=format&fit=crop",
  craftBindery: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80&auto=format&fit=crop",
  paper: "https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?w=1200&q=80&auto=format&fit=crop",
  bookOpen: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=1200&q=80&auto=format&fit=crop",
  bookStack: "https://images.unsplash.com/photo-1518842013791-b874a8eb6ddf?w=1200&q=80&auto=format&fit=crop",
  leather: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80&auto=format&fit=crop",
};

// ============ Products ============
const FALLBACK_PRODUCTS = [
  {
    slug: "heritage-grand",
    name: "Heritage Grand",
    tagline: "Our largest, most considered album. Hand-bound in Jodhpur.",
    price: 599,
    sizes: ["12×12 in", "14×11 in"],
    pages: [40, 60, 80, 100],
    cover: ["Linen", "Full-grain leather", "Block-printed silk"],
    paper: ["Matte 200gsm", "Pearl 250gsm", "Cotton rag 300gsm"],
    image: STOCK.weddingCouple,
    images: [STOCK.weddingCouple, STOCK.bookOpen, STOCK.craft, STOCK.weddingHands],
    rating: 4.9,
    reviews: 312,
    tier: "Heritage",
    badge: "Bestseller",
    color: "#3A1F1A",
  },
  {
    slug: "moti-classic",
    name: "Moti Classic",
    tagline: "A timeless layflat photo book. Our most-loved size.",
    price: 449,
    sizes: ["10×10 in", "12×9 in"],
    pages: [30, 40, 60, 80],
    cover: ["Linen", "Full-grain leather"],
    paper: ["Matte 200gsm", "Pearl 250gsm"],
    image: STOCK.weddingMandap,
    images: [STOCK.weddingMandap, STOCK.bookStack, STOCK.craftBindery],
    rating: 4.8,
    reviews: 487,
    tier: "Signature",
    color: "#6F4A2A",
  },
  {
    slug: "safar-travel",
    name: "Safar Travel Journal",
    tagline: "Compact, layflat, made for the road.",
    price: 399,
    sizes: ["8×8 in", "10×7 in"],
    pages: [30, 40, 60],
    cover: ["Linen", "Vegan-leather"],
    paper: ["Matte 200gsm"],
    image: STOCK.travel,
    images: [STOCK.travel, STOCK.travelTaj, STOCK.bookOpen],
    rating: 4.9,
    reviews: 218,
    tier: "Signature",
    color: "#7A8569",
  },
  {
    slug: "rasm-wedding",
    name: "Rasm Wedding Folio",
    tagline: "A two-volume set, presented in a hand-stitched slipcase.",
    price: 599,
    sizes: ["11×11 in"],
    pages: [60, 80, 100],
    cover: ["Block-printed silk", "Brocade", "Full-grain leather"],
    paper: ["Pearl 250gsm", "Cotton rag 300gsm"],
    image: STOCK.weddingBride,
    images: [STOCK.weddingBride, STOCK.weddingFlowers, STOCK.weddingHenna],
    rating: 5.0,
    reviews: 142,
    tier: "Heritage",
    badge: "New",
    color: "#7A2A2A",
  },
  {
    slug: "ghar-family",
    name: "Ghar Family Album",
    tagline: "For the everyday — first steps, birthdays, ordinary magic.",
    price: 419,
    sizes: ["10×10 in", "12×9 in"],
    pages: [30, 40, 60, 80],
    cover: ["Linen", "Vegan-leather"],
    paper: ["Matte 200gsm", "Pearl 250gsm"],
    image: STOCK.family,
    images: [STOCK.family, STOCK.bookStack, STOCK.paper],
    rating: 4.8,
    reviews: 264,
    tier: "Signature",
    color: "#5A6E4A",
  },
  {
    slug: "khaas-petite",
    name: "Khaas Petite",
    tagline: "A pocket-sized keepsake. Perfect as a gift.",
    price: 419,
    sizes: ["6×6 in", "5×7 in"],
    pages: [20, 30, 40],
    cover: ["Linen", "Block-printed cotton"],
    paper: ["Matte 200gsm"],
    image: STOCK.weddingHenna,
    images: [STOCK.weddingHenna, STOCK.craft],
    rating: 4.7,
    reviews: 396,
    tier: "Petite",
    color: "#9A6B3F",
  },
  {
    slug: "virasat-portfolio",
    name: "Virasat Portfolio",
    tagline: "Archival print quality. For curated work.",
    price: 549,
    sizes: ["13×10 in"],
    pages: [40, 60, 80],
    cover: ["Linen", "Full-grain leather"],
    paper: ["Cotton rag 300gsm"],
    image: STOCK.weddingDance,
    images: [STOCK.weddingDance, STOCK.bookOpen, STOCK.leather],
    rating: 4.9,
    reviews: 88,
    tier: "Heritage",
    color: "#1C1A17",
  },
];

const SHOPIFY_CONFIG = {
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  storefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN,
  apiVersion: import.meta.env.VITE_SHOPIFY_API_VERSION || "2026-04",
};
function resolveApiBaseUrl(rawValue) {
  const configured = (rawValue || "").trim().replace(/\/$/, "");
  if (configured.includes("localhost") && import.meta.env.PROD) return "";
  if (configured) return configured;
  if (import.meta.env.DEV && typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port && window.location.port !== "3000") {
    return "http://localhost:3000";
  }
  return "";
}

const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const SHOPIFY_PRODUCTS_QUERY = `
  query SafarnamaProducts {
    products(first: 50) {
      nodes {
        id
        handle
        title
        description
        productType
        tags
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          nodes {
            url
            altText
          }
        }
        options {
          name
          values
        }
        variants(first: 50) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
        metafields(identifiers: [
          { namespace: "custom", key: "tagline" }
          { namespace: "custom", key: "tier" }
          { namespace: "custom", key: "badge" }
          { namespace: "custom", key: "rating" }
          { namespace: "custom", key: "reviews" }
          { namespace: "custom", key: "color" }
        ]) {
          key
          value
        }
      }
    }
  }
`;

const ProductDataContext = createContext({
  products: FALLBACK_PRODUCTS,
  loading: false,
  error: null,
});

function useProducts() {
  return useContext(ProductDataContext);
}

function getShopifyEndpoint() {
  if (!SHOPIFY_CONFIG.storeDomain || !SHOPIFY_CONFIG.storefrontToken) {
    throw new Error("Missing Shopify environment variables.");
  }
  return `https://${SHOPIFY_CONFIG.storeDomain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;
}

async function shopifyStorefrontRequest(query, variables = {}, signal) {
  const response = await fetch(getShopifyEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_CONFIG.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((err) => err.message).join("; "));
  }

  return payload.data;
}

function useShopifyProducts() {
  const [state, setState] = useState({
    products: FALLBACK_PRODUCTS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!SHOPIFY_CONFIG.storeDomain || !SHOPIFY_CONFIG.storefrontToken) {
      setState({ products: FALLBACK_PRODUCTS, loading: false, error: "Missing Shopify environment variables." });
      return;
    }

    const controller = new AbortController();

    async function fetchProducts() {
      try {
        const data = await shopifyStorefrontRequest(SHOPIFY_PRODUCTS_QUERY, {}, controller.signal);
        const shopifyProducts = (data?.products?.nodes || [])
          .map(mapShopifyProduct)
          .filter(Boolean);

        setState({
          products: shopifyProducts.length ? shopifyProducts : FALLBACK_PRODUCTS,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Unable to load Shopify products", err);
        setState({ products: FALLBACK_PRODUCTS, loading: false, error: err.message });
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, []);

  return state;
}

function mapShopifyProduct(product, index) {
  const fallback = FALLBACK_PRODUCTS[index % FALLBACK_PRODUCTS.length];
  const images = product.images?.nodes?.map((image) => image.url).filter(Boolean) || [];
  const variants = (product.variants?.nodes || []).map(mapShopifyVariant);
  const prices = variants
    .map((variant) => variant.price)
    .filter((amount) => Number.isFinite(amount));
  const currency = variants.find((variant) => variant.currency)?.currency || "AUD";

  const sizes = getOptionValues(product, ["size"]) || fallback.sizes;
  const pages = getPageValues(product) || fallback.pages;
  const cover = getOptionValues(product, ["cover", "material"]) || fallback.cover;
  const paper = getOptionValues(product, ["paper", "quality"]) || fallback.paper;
  const tier = getMetafield(product, "tier") || getTierFromTags(product.tags) || fallback.tier;
  const description = (product.description || "").trim();

  return {
    slug: product.handle,
    name: product.title,
    tagline: getMetafield(product, "tagline") || excerptText(description) || fallback.tagline,
    price: prices.length ? Math.min(...prices) : fallback.price,
    currency,
    sizes,
    pages,
    cover,
    paper,
    variants,
    image: product.featuredImage?.url || images[0] || fallback.image,
    images: images.length ? images : fallback.images,
    rating: Number.parseFloat(getMetafield(product, "rating")) || fallback.rating,
    reviews: Number.parseInt(getMetafield(product, "reviews"), 10) || fallback.reviews,
    tier,
    badge: getMetafield(product, "badge") || (product.tags || []).find((tag) => /new|bestseller|sale/i.test(tag)),
    color: getMetafield(product, "color") || fallback.color,
  };
}

function mapShopifyVariant(variant) {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: Number.parseFloat(variant.price?.amount),
    currency: variant.price?.currencyCode || "AUD",
    selectedOptions: variant.selectedOptions || [],
  };
}

function getMetafield(product, key) {
  return product.metafields?.find((field) => field?.key === key)?.value?.trim();
}

function getTierFromTags(tags = []) {
  return tags.find((tag) => /^(Petite|Signature|Heritage)$/i.test(tag));
}

function getOptionValues(product, names) {
  const optionValues = product.options
    ?.find((option) => names.some((name) => option.name.toLowerCase().includes(name)))
    ?.values
    ?.filter((value) => value && value !== "Default Title");

  if (optionValues?.length) return optionValues;

  const variantValues = product.variants?.nodes
    ?.flatMap((variant) => variant.selectedOptions || [])
    ?.filter((option) => names.some((name) => option.name.toLowerCase().includes(name)))
    ?.map((option) => option.value)
    ?.filter((value) => value && value !== "Default Title");

  return uniqueValues(variantValues);
}

function getPageValues(product) {
  const rawValues = getOptionValues(product, ["page"]);
  const pages = rawValues
    ?.map((value) => Number.parseInt(String(value).match(/\d+/)?.[0], 10))
    ?.filter((value) => Number.isFinite(value))
    ?.sort((a, b) => a - b);

  return uniqueValues(pages);
}

function uniqueValues(values = []) {
  const unique = [...new Set(values)];
  return unique.length ? unique : null;
}

function excerptText(text, limit = 132) {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit).replace(/\s+\S*$/, "")}...`;
}

function formatCurrency(amount, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function getConfiguredUnitPrice(product, pages, cover) {
  return product.price + (pages > 40 ? (pages - 40) * 4 : 0) + (cover.includes("leather") || cover.includes("silk") || cover.includes("Brocade") ? 60 : 0);
}

function cartItemKey({ slug, size, pages, cover, paper }) {
  return [slug, size, pages, cover, paper].join("::");
}

function buildCartItem({ product, size, pages, cover, paper, qty, albumDesign, project, status, professionalDesignRequest }) {
  const variant = findMatchingVariant(product, { size, pages, cover, paper });
  const price = variant?.price || getConfiguredUnitPrice(product, pages, cover);
  const key = cartItemKey({ slug: product.slug, size, pages, cover, paper });
  const id = professionalDesignRequest?.requested ? `${key}::team-design::${Date.now()}` : key;
  const configParts = [size, `${pages} pages`, cover, paper].filter(Boolean);

  return {
    id,
    slug: product.slug,
    name: product.name,
    tier: product.tier,
    config: configParts.join(" · "),
    details: { size, pages, cover, paper },
    price,
    currency: product.currency || "AUD",
    variantId: variant?.id,
    variantTitle: variant?.title,
    qty,
    status: status || (professionalDesignRequest?.requested ? "Team design requested" : albumDesign?.isComplete ? "Designed" : "Awaiting photos"),
    thumb: product.image,
    project: project || albumDesign?.projectName || professionalDesignRequest?.projectName || "New album",
    albumDesign: albumDesign || null,
    professionalDesignRequest: professionalDesignRequest || null,
  };
}

function cartItemCount(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function normalizeOption(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function optionMatches(selectedOption, names, value) {
  if (!value) return false;
  const optionName = selectedOption.name.toLowerCase();
  return names.some((name) => optionName.includes(name)) && normalizeOption(selectedOption.value) === normalizeOption(value);
}

function findMatchingVariant(product, selections) {
  const variants = product.variants || [];
  if (!variants.length) return null;

  const available = variants.filter((variant) => variant.availableForSale);
  const candidates = available.length ? available : variants;
  const desiredOptions = [
    { names: ["size"], value: selections.size },
    { names: ["page"], value: selections.pages },
    { names: ["cover", "material"], value: selections.cover },
    { names: ["paper", "quality"], value: selections.paper },
  ];

  const scored = candidates.map((variant) => {
    const score = desiredOptions.reduce((total, desired) => {
      return total + (variant.selectedOptions.some((option) => optionMatches(option, desired.names, desired.value)) ? 1 : 0);
    }, 0);
    return { variant, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.variant.availableForSale !== b.variant.availableForSale) return a.variant.availableForSale ? -1 : 1;
    return (a.variant.price || Infinity) - (b.variant.price || Infinity);
  });

  return scored[0]?.variant || null;
}

function createShopifyCartAttributes(item) {
  return [
    ["Product", item.name],
    ["Selected size", item.details?.size],
    ["Selected pages", item.details?.pages ? `${item.details.pages} pages` : ""],
    ["Selected cover", item.details?.cover],
    ["Selected paper", item.details?.paper],
    ["Variant", item.variantTitle],
    ["Album design", item.albumDesign?.isComplete ? "Complete" : ""],
    ["Album spreads", item.albumDesign?.spreadCount],
    ["Album pages", item.albumDesign?.pageCount],
    ["Design service", item.professionalDesignRequest?.requested ? "Professional team design requested" : ""],
    ["Uploaded assets", item.professionalDesignRequest?.assets?.length],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value: String(value) }));
}

async function createShopifyCheckout(items) {
  if (!items.length) {
    throw new Error("Your cart is empty.");
  }

  const checkoutItems = items.map((item) => {
    if (!item.variantId) {
      throw new Error(`${item.name} is missing a Shopify variant and cannot be checked out yet.`);
    }

    return {
      id: item.id,
      variantId: item.variantId,
      variantTitle: item.variantTitle,
      quantity: item.qty,
      name: item.name,
      slug: item.slug,
      tier: item.tier,
      details: item.details,
      project: item.project,
      status: item.status,
      albumDesign: item.albumDesign || null,
      professionalDesignRequest: item.professionalDesignRequest || null,
      attributes: createShopifyCartAttributes(item),
    };
  });

  const response = await fetch(`${API_BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: checkoutItems }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Checkout failed with ${response.status}`);
  }

  if (data.appCartId) {
    try {
      window.localStorage.setItem("safarnama:lastAppCartId", data.appCartId);
    } catch {
      // Checkout can continue if browser storage is unavailable.
    }
  }
  if (data.appOrderId) {
    try {
      window.localStorage.setItem("safarnama:lastAppOrderId", data.appOrderId);
    } catch {
      // Checkout can continue if browser storage is unavailable.
    }
  }

  const checkoutUrl = data.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("The backend did not return a Shopify checkout URL.");
  }

  return checkoutUrl;
}

async function fetchOrderStatus(appOrderId) {
  const cleanId = appOrderId.trim();
  if (!cleanId) {
    throw new Error("Enter your Safarnama order ID.");
  }

  const response = await fetch(`${API_BASE_URL}/api/order-status?app_order_id=${encodeURIComponent(cleanId)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Order lookup failed with ${response.status}`);
  }

  return data;
}

function formatStatusDate(value) {
  if (!value) return "Not available yet";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const TESTIMONIALS = [
  {
    quote: "It arrived wrapped in muslin, tied with cotton thread. The book itself is exquisite — every page lay flat, every spread treated like a small painting.",
    author: "Anika & Ravi",
    location: "Sydney, NSW",
    product: "Rasm Wedding Folio",
    rating: 5,
  },
  {
    quote: "I cried opening it. Thirty years of family photos finally have a home worthy of them.",
    author: "Meera S.",
    location: "Melbourne, VIC",
    product: "Ghar Family Album",
    rating: 5,
  },
  {
    quote: "The team in Sydney emailed me twice during the proof — caught a low-resolution photo I would have missed. Properly considered service.",
    author: "Daniel L.",
    location: "Brisbane, QLD",
    product: "Heritage Grand",
    rating: 5,
  },
];

const REVIEW_SOURCES = [
  { name: "Google", rating: 4.9, count: 1247, dot: "#4285F4" },
  { name: "Trustpilot", rating: 4.8, count: 892, dot: "#00B67A" },
  { name: "Facebook", rating: 4.9, count: 564, dot: "#1877F2" },
];

// ============ Logo ============
function Logo({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 169 16" fill={color} xmlns="http://www.w3.org/2000/svg" aria-label="Safarnama">
      <path d="M151.336 14.6801L158.476 0.400069C158.53 0.346735 158.576 0.320068 158.616 0.320068L161.616 0.320068C161.683 0.320068 161.73 0.346735 161.756 0.400069L168.916 14.6801C168.943 14.7334 168.936 14.7867 168.896 14.8401C168.87 14.8934 168.83 14.9201 168.776 14.9201L166.036 14.9201C165.97 14.9201 165.923 14.8867 165.896 14.8201L164.696 12.4201C164.67 12.3667 164.623 12.3401 164.556 12.3401H155.676C155.623 12.3401 155.583 12.3667 155.556 12.4201L154.356 14.8201C154.316 14.8867 154.27 14.9201 154.216 14.9201H151.476C151.41 14.9201 151.363 14.8934 151.336 14.8401C151.31 14.7867 151.31 14.7334 151.336 14.6801ZM157.116 9.58007H163.116C163.156 9.58007 163.183 9.56674 163.196 9.54007C163.223 9.50007 163.223 9.46673 163.196 9.44007L160.176 3.40007C160.15 3.3334 160.116 3.3334 160.076 3.40007L157.036 9.44007C157.01 9.5334 157.036 9.58007 157.116 9.58007Z"/>
      <path d="M130.329 0.300049L132.309 0.300049C132.363 0.300049 132.416 0.326715 132.469 0.380048L139.369 8.70005C139.396 8.72672 139.429 8.72672 139.469 8.70005L146.349 0.380048C146.403 0.326715 146.456 0.300049 146.509 0.300049L148.509 0.300049C148.643 0.300049 148.709 0.373382 148.709 0.520048V14.68C148.709 14.8267 148.643 14.9 148.509 14.9H146.169C146.036 14.9 145.969 14.8267 145.969 14.68V5.36005C145.969 5.32005 145.949 5.30005 145.909 5.30005C145.883 5.30005 145.863 5.30671 145.849 5.32005L140.189 12.14C140.136 12.1934 140.083 12.22 140.029 12.22H138.809C138.743 12.22 138.683 12.1934 138.629 12.14L132.969 5.32005C132.943 5.30671 132.929 5.30005 132.929 5.30005C132.889 5.30005 132.869 5.32005 132.869 5.36005V14.68C132.869 14.8267 132.796 14.9 132.649 14.9H130.329C130.183 14.9 130.109 14.8267 130.109 14.68V0.520048C130.109 0.373382 130.183 0.300049 130.329 0.300049Z"/>
      <path d="M109.911 14.6801L117.051 0.400069C117.104 0.346735 117.151 0.320068 117.191 0.320068L120.191 0.320068C120.257 0.320068 120.304 0.346735 120.331 0.400069L127.491 14.6801C127.517 14.7334 127.511 14.7867 127.471 14.8401C127.444 14.8934 127.404 14.9201 127.351 14.9201L124.611 14.9201C124.544 14.9201 124.497 14.8867 124.471 14.8201L123.271 12.4201C123.244 12.3667 123.197 12.3401 123.131 12.3401H114.251C114.197 12.3401 114.157 12.3667 114.131 12.4201L112.931 14.8201C112.891 14.8867 112.844 14.9201 112.791 14.9201H110.051C109.984 14.9201 109.937 14.8934 109.911 14.8401C109.884 14.7867 109.884 14.7334 109.911 14.6801ZM115.691 9.58007H121.691C121.731 9.58007 121.757 9.56674 121.771 9.54007C121.797 9.50007 121.797 9.46673 121.771 9.44007L118.751 3.40007C118.724 3.3334 118.691 3.3334 118.651 3.40007L115.611 9.44007C115.584 9.5334 115.611 9.58007 115.691 9.58007Z"/>
      <path d="M91.9304 0.340068L93.9504 0.340068C94.0304 0.340068 94.0771 0.360068 94.0904 0.400069L104.41 10.4201C104.424 10.4334 104.444 10.4401 104.47 10.4401C104.51 10.4401 104.53 10.4201 104.53 10.3801L104.51 0.520068C104.51 0.386735 104.577 0.320068 104.71 0.320068L107.07 0.320068C107.204 0.320068 107.27 0.386735 107.27 0.520068L107.29 14.6801C107.29 14.8267 107.217 14.9001 107.07 14.9001H105.15C105.084 14.9001 105.037 14.8801 105.01 14.8401L94.5904 4.72007C94.5638 4.6934 94.5371 4.68673 94.5104 4.70007C94.4971 4.7134 94.4904 4.7334 94.4904 4.76007V14.7001C94.4904 14.8334 94.4171 14.9001 94.2704 14.9001H91.9304C91.7971 14.9001 91.7304 14.8334 91.7304 14.7001V0.540068C91.7304 0.406735 91.7971 0.340068 91.9304 0.340068Z"/>
      <path d="M72.8047 0.440068C72.8047 0.360068 72.8447 0.320068 72.9247 0.320068L84.1647 0.320068C84.818 0.320068 85.418 0.453402 85.9647 0.720068C86.5247 0.973401 87.0047 1.32007 87.4047 1.76007C87.818 2.20007 88.138 2.70674 88.3647 3.28007C88.6047 3.84007 88.7247 4.42007 88.7247 5.02007C88.7247 5.6334 88.6113 6.20007 88.3847 6.72007C88.158 7.24007 87.8447 7.6934 87.4447 8.08007C87.0447 8.46674 86.5647 8.7734 86.0047 9.00007C85.458 9.2134 84.8647 9.32674 84.2247 9.34007C84.1713 9.34007 84.1647 9.36007 84.2047 9.40007L89.1047 14.7401C89.1313 14.7667 89.1313 14.8001 89.1047 14.8401C89.0913 14.8801 89.0647 14.9001 89.0247 14.9001L85.7847 14.9001C85.758 14.9001 85.7313 14.8867 85.7047 14.8601L80.6647 9.38007C80.638 9.3534 80.6113 9.34007 80.5847 9.34007H75.6847C75.6047 9.34007 75.5647 9.38007 75.5647 9.46007V14.7601C75.5647 14.8401 75.5247 14.8801 75.4447 14.8801H72.9247C72.8447 14.8801 72.8047 14.8401 72.8047 14.7601V0.440068ZM75.6847 6.58007L84.1647 6.58007C84.378 6.58007 84.5913 6.5534 84.8047 6.50007C85.018 6.4334 85.2113 6.34007 85.3847 6.22007C85.558 6.08673 85.698 5.92007 85.8047 5.72007C85.9113 5.52007 85.9647 5.28673 85.9647 5.02007C85.9647 4.7534 85.9113 4.50673 85.8047 4.28007C85.7113 4.04007 85.578 3.8334 85.4047 3.66007C85.2313 3.48673 85.038 3.34673 84.8247 3.24007C84.6113 3.1334 84.3913 3.08007 84.1647 3.08007L75.6847 3.08007C75.6047 3.08007 75.5647 3.12007 75.5647 3.20007V6.46007C75.5647 6.54007 75.6847 6.58007 75.6847 6.58007Z"/>
      <path d="M52.6059 14.6801L59.7459 0.400069C59.7993 0.346735 59.8459 0.320068 59.8859 0.320068L62.8859 0.320068C62.9526 0.320068 62.9993 0.346735 63.0259 0.400069L70.1859 14.6801C70.2126 14.7334 70.2059 14.7867 70.1659 14.8401C70.1393 14.8934 70.0993 14.9201 70.0459 14.9201L67.3059 14.9201C67.2393 14.9201 67.1926 14.8867 67.1659 14.8201L65.9659 12.4201C65.9393 12.3667 65.8926 12.3401 65.8259 12.3401H56.9459C56.8926 12.3401 56.8526 12.3667 56.8259 12.4201L55.6259 14.8201C55.5859 14.8867 55.5393 14.9201 55.4859 14.9201H52.7459C52.6793 14.9201 52.6326 14.8934 52.6059 14.8401C52.5793 14.7867 52.5793 14.7334 52.6059 14.6801ZM58.3859 9.58007H64.3859C64.4259 9.58007 64.4526 9.56674 64.4659 9.54007C64.4926 9.50007 64.4926 9.46673 64.4659 9.44007L61.4459 3.40007C61.4193 3.3334 61.3859 3.3334 61.3459 3.40007L58.3059 9.44007C58.2793 9.5334 58.3059 9.58007 58.3859 9.58007Z"/>
      <path d="M39.1566 0.320068L52.1966 0.320068C52.2899 0.320068 52.3432 0.360068 52.3566 0.440068L53.1366 2.86007C53.1632 2.9134 53.1566 2.96673 53.1166 3.02007C53.0899 3.06007 53.0432 3.08007 52.9766 3.08007L41.8966 3.08007C41.7899 3.08007 41.7366 3.1334 41.7366 3.24007V6.94007C41.7366 7.04673 41.7899 7.10007 41.8966 7.10007L50.3966 7.10007C50.4632 7.10007 50.5099 7.12673 50.5366 7.18007C50.5766 7.22007 50.5832 7.26674 50.5566 7.32007L49.7966 9.74007C49.7699 9.82007 49.7166 9.86007 49.6366 9.86007H41.8966C41.7899 9.86007 41.7366 9.9134 41.7366 10.0201V14.7401C41.7366 14.8601 41.6766 14.9201 41.5566 14.9201H39.1566C39.0366 14.9201 38.9766 14.8601 38.9766 14.7401V0.500068C38.9766 0.380068 39.0366 0.320068 39.1566 0.320068Z"/>
      <path d="M18.7778 14.6801L25.9178 0.400069C25.9711 0.346735 26.0178 0.320068 26.0578 0.320068L29.0578 0.320068C29.1245 0.320068 29.1711 0.346735 29.1978 0.400069L36.3578 14.6801C36.3845 14.7334 36.3778 14.7867 36.3378 14.8401C36.3111 14.8934 36.2711 14.9201 36.2178 14.9201L33.4778 14.9201C33.4111 14.9201 33.3645 14.8867 33.3378 14.8201L32.1378 12.4201C32.1111 12.3667 32.0645 12.3401 31.9978 12.3401H23.1178C23.0645 12.3401 23.0245 12.3667 22.9978 12.4201L21.7978 14.8201C21.7578 14.8867 21.7111 14.9201 21.6578 14.9201H18.9178C18.8511 14.9201 18.8045 14.8934 18.7778 14.8401C18.7511 14.7867 18.7511 14.7334 18.7778 14.6801ZM24.5578 9.58007H30.5578C30.5978 9.58007 30.6245 9.56674 30.6378 9.54007C30.6645 9.50007 30.6645 9.46673 30.6378 9.44007L27.6178 3.40007C27.5911 3.3334 27.5578 3.3334 27.5178 3.40007L24.4778 9.44007C24.4511 9.5334 24.4778 9.58007 24.5578 9.58007Z"/>
      <path d="M8.82 15.22C7.64667 15.22 6.58667 15.16 5.64 15.04C4.70667 14.92 3.89333 14.7867 3.2 14.64C2.52 14.48 1.97333 14.3333 1.56 14.2C1.16 14.0533 0.9 13.9533 0.78 13.9C0.74 13.8733 0.72 13.8467 0.72 13.82L0.42 10.74C0.42 10.6467 0.453333 10.6 0.52 10.6C0.533333 10.6 0.54 10.6067 0.54 10.62C0.553333 10.62 0.566667 10.62 0.58 10.62C0.766667 10.7267 1.08 10.8867 1.52 11.1C1.96 11.3 2.52667 11.5 3.22 11.7C3.91333 11.9 4.72667 12.08 5.66 12.24C6.59333 12.3867 7.64667 12.46 8.82 12.46C10.3533 12.46 11.5533 12.2933 12.42 11.96C13.3 11.6133 13.74 11.16 13.74 10.6C13.74 10.4 13.6333 10.2133 13.42 10.04C13.2067 9.85333 12.8667 9.69333 12.4 9.56C11.9333 9.41333 11.34 9.3 10.62 9.22C9.9 9.14 9.02667 9.1 8 9.1C6.72 9.1 5.63333 9.02 4.74 8.86C3.86 8.7 3.12 8.49333 2.52 8.24C1.93333 7.97333 1.46667 7.68 1.12 7.36C0.786667 7.04 0.533333 6.72 0.36 6.4C0.2 6.06667 0.1 5.75333 0.0600001 5.46C0.0200001 5.16667 0 4.92667 0 4.74C0 3.79333 0.26 3.01333 0.78 2.4C1.31333 1.78667 1.99333 1.30667 2.82 0.960001C3.64667 0.600001 4.57333 0.353334 5.6 0.220001C6.64 0.0733336 7.66 0 8.66 0C9.56667 0 10.3933 0.06 11.14 0.18C11.9 0.286667 12.5667 0.413334 13.14 0.56C13.7133 0.706667 14.18 0.853334 14.54 1C14.9 1.13333 15.1333 1.22667 15.24 1.28C15.28 1.28 15.3 1.30667 15.3 1.36L15.5 4.34C15.5267 4.42 15.4933 4.46 15.4 4.46C15.3867 4.46 15.3733 4.46 15.36 4.46C15.36 4.44667 15.3533 4.44 15.34 4.44C15.1 4.29333 14.76 4.12667 14.32 3.94C13.8933 3.74 13.3867 3.55333 12.8 3.38C12.2133 3.20667 11.5667 3.06 10.86 2.94C10.1667 2.82 9.43333 2.76 8.66 2.76C7.40667 2.76 6.39333 2.82667 5.62 2.96C4.84667 3.09333 4.24667 3.26 3.82 3.46C3.39333 3.64667 3.10667 3.86 2.96 4.1C2.82667 4.32667 2.76 4.54 2.76 4.74C2.76 5.3 3.22667 5.70667 4.16 5.96C5.09333 6.21333 6.37333 6.34 8 6.34C8.49333 6.34 9.04667 6.35333 9.66 6.38C10.2733 6.40667 10.9 6.47333 11.54 6.58C12.18 6.67333 12.8067 6.81333 13.42 7C14.0333 7.18667 14.58 7.44667 15.06 7.78C15.54 8.1 15.9267 8.5 16.22 8.98C16.5133 9.46 16.66 10.0333 16.66 10.7C16.66 11.4067 16.5067 12.0267 16.2 12.56C15.9067 13.0933 15.5333 13.5467 15.08 13.92C14.6267 14.28 14.1067 14.5733 13.52 14.8C12.9467 15.0133 12.3733 15.18 11.8 15.3C11.2267 15.4067 10.6733 15.4733 10.14 15.5C9.62 15.5267 9.18 15.54 8.82 15.54Z"/>
    </svg>
  );
}

// ============ Star ratings ============
function Stars({ rating = 5, size = 12, color = "var(--accent)" }) {
  const full = Math.floor(rating);
  return (
    <span style={{ display: "inline-flex", gap: 1, color, lineHeight: 1 }}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < full ? color : "none"} stroke={color} strokeWidth="1.5">
          <path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.6L6 22l1.5-7.3L2 10l7.1-1.1L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

// ============ Top nav ============
function TopNav({ active, navigate, cartCount = 0 }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <a className="logo" onClick={() => navigate("home")} style={{cursor:"pointer"}}>
            <Logo color="var(--ink)" />
          </a>
          <div className="nav-links">
            <a className={`nav-link ${active === "shop" ? "active" : ""}`} onClick={() => navigate("shop")} style={{cursor:"pointer"}}>Shop</a>
            <a className={`nav-link ${active === "studio" ? "active" : ""}`} onClick={() => navigate("studio")} style={{cursor:"pointer"}}>Design Studio</a>
            <a className={`nav-link ${active === "about" ? "active" : ""}`} onClick={() => navigate("about")} style={{cursor:"pointer"}}>Our Craft</a>
            <a className={`nav-link ${active === "blog" ? "active" : ""}`} onClick={() => navigate("blog")} style={{cursor:"pointer"}}>Journal</a>
            <a className={`nav-link ${active === "contact" ? "active" : ""}`} onClick={() => navigate("contact")} style={{cursor:"pointer"}}>Contact</a>
            <a className={`nav-link ${active === "status" ? "active" : ""}`} onClick={() => navigate("status")} style={{cursor:"pointer"}}>Order Status</a>
            <a className={`nav-link ${active === "admin" ? "active" : ""}`} onClick={() => navigate("admin")} style={{cursor:"pointer"}}>Admin</a>
          </div>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button className="icon-btn" aria-label="Account" onClick={() => navigate("account")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          </button>
          <button className="icon-btn" aria-label="Cart" onClick={() => navigate("cart")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h2.5l2.5 11h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("shop")}>Start your album</button>
        </div>
      </div>
      <Marquee />
    </nav>
  );
}

function Marquee() {
  const items = [
    "Hand-bound in Jodhpur",
    "Reviewed in Sydney",
    "Free shipping across Australia over $400",
    "Archival, museum-grade papers",
    "Made-to-order in 4–6 weeks",
    "Lifetime binding guarantee",
  ];
  const all = [...items, ...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {all.map((it, i) => (
          <span className="marquee-item" key={i}>{it}</span>
        ))}
      </div>
    </div>
  );
}

// ============ Footer ============
function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ marginBottom: 24, height: 18 }}>
              <Logo color="var(--bg)" />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.75, maxWidth: 320, margin: 0 }}>
              Safarnama is a small studio crafting heirloom photo books and albums between Sydney and Jodhpur. Every book is reviewed by hand before it travels.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              {["instagram","pinterest","facebook"].map(s => (
                <a key={s} className="icon-btn" style={{ color: "var(--bg)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <span style={{ fontSize: 11, letterSpacing: 0.06, textTransform:"capitalize" }}>{s[0]}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a onClick={() => navigate("shop")} style={{cursor:"pointer"}}>All books</a></li>
              <li><a onClick={() => navigate("shop")} style={{cursor:"pointer"}}>Wedding</a></li>
              <li><a onClick={() => navigate("shop")} style={{cursor:"pointer"}}>Family</a></li>
              <li><a onClick={() => navigate("shop")} style={{cursor:"pointer"}}>Travel</a></li>
              <li><a onClick={() => navigate("shop")} style={{cursor:"pointer"}}>Gift cards</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Studio</h4>
            <ul>
              <li><a onClick={() => navigate("about")} style={{cursor:"pointer"}}>Our craft</a></li>
              <li><a onClick={() => navigate("studio")} style={{cursor:"pointer"}}>Design Studio</a></li>
              <li><a onClick={() => navigate("blog")} style={{cursor:"pointer"}}>Journal</a></li>
              <li><a>Trade & bulk</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><a onClick={() => navigate("faq")} style={{cursor:"pointer"}}>FAQs</a></li>
              <li><a onClick={() => navigate("faq")} style={{cursor:"pointer"}}>Shipping</a></li>
              <li><a onClick={() => navigate("faq")} style={{cursor:"pointer"}}>Returns</a></li>
              <li><a onClick={() => navigate("contact")} style={{cursor:"pointer"}}>Contact</a></li>
              <li><a onClick={() => navigate("account")} style={{cursor:"pointer"}}>Order tracking</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Newsletter</h4>
            <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 16px" }}>Quiet emails — new editions, studio notes, occasional offers.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="you@email.com" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "var(--bg)" }} />
              <button className="btn btn-accent btn-sm">→</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Safarnama Studio Pty Ltd · ABN 12 345 678 901 · Made between Sydney & Jodhpur</span>
          <span style={{ display: "flex", gap: 18 }}>
            <a>Privacy</a><a>Terms</a><a>Accessibility</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ============ Image with placeholder fallback ============
function SmartImage({ src, alt, className, style }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className={className} style={{ background: "linear-gradient(135deg, var(--bg-3) 0%, var(--bg-2) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "ui-monospace, monospace", fontSize: 11, ...style }}>
        {alt || "image"}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} />;
}

// expose
Object.assign(window, {
  React, useState, useEffect, useRef, useMemo,
  STOCK, PRODUCTS: FALLBACK_PRODUCTS, TESTIMONIALS, REVIEW_SOURCES,
  Logo, Stars, TopNav, Footer, SmartImage,
});


// ===== tweaks-panel.jsx =====

// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', noDeckControls = false, children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(
    () => typeof document !== 'undefined' && !!document.querySelector('deck-stage'),
    [],
  );
  const [railVisible, setRailVisible] = React.useState(() => {
    try { return localStorage.getItem('deck-stage.railVisible') !== '0'; } catch (e) { return true; }
  });
  const toggleRail = (on) => {
    setRailVisible(on);
    window.postMessage({ type: '__deck_rail_visible', on }, '*');
  };
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-noncommentable=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {hasDeckStage && !noDeckControls && (
            <TweakSection label="Deck">
              <TweakToggle label="Thumbnail rail" value={railVisible} onChange={toggleRail} />
            </TweakSection>
          )}
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});


// ===== page-home.jsx =====
// Home / Landing page
const { useState: useStateHome, useEffect: useEffectHome } = React;

function HomePage({ navigate, tweaks }) {
  const { products } = useProducts();
  const heroVariant = tweaks.heroVariant || "image";
  const cardStyle = tweaks.cardStyle || "tall";

  return (
    <div className="home-page">
      {/* HERO */}
      {heroVariant === "image" ? <HeroImage navigate={navigate} /> : <HeroType navigate={navigate} />}

      {/* TRUST STRIP */}
      <section style={{ padding: "32px 0", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
            <span className="eyebrow">Trusted by 10,000+ Australian families</span>
            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
              {REVIEW_SOURCES.map(r => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, background: r.dot, borderRadius: "50%" }}></span>
                  <span style={{ fontSize: 13 }}>{r.name}</span>
                  <Stars rating={r.rating} size={11} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.rating} · {r.count.toLocaleString()} reviews</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section style={{ padding: "100px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48 }}>
            <div>
              <span className="eyebrow">The Collection</span>
              <h2 className="headline" style={{ marginTop: 12, maxWidth: 640 }}>
                Albums, made by hand. Designed by you.
              </h2>
            </div>
            <a className="btn btn-ghost" onClick={() => navigate("shop")}>View all books →</a>
          </div>
          <div className={cardStyle === "tall" ? "products-grid-tall" : "products-grid-wide"}>
            {products.slice(0, 4).map((p, i) => (
              <ProductCard key={p.slug} product={p} navigate={navigate} variant={cardStyle} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div className="surface" style={{ padding: 64, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <span className="eyebrow">How it works</span>
                <h2 className="headline" style={{ marginTop: 12, marginBottom: 24 }}>
                  Four quiet steps from photographs<br/>to a book in your hands.
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 40 }}>
                  {[
                    { n: "01", t: "Choose a book", d: "Begin with the shape, size and binding that suits your story." },
                    { n: "02", t: "Upload your photos", d: "We accept high-resolution files only — your album deserves the detail." },
                    { n: "03", t: "Design in our Studio", d: "Drag, drop, fine-tune. Or let us design it for you, free of charge." },
                    { n: "04", t: "Reviewed, then made", d: "Our Sydney team proofs every order before it travels to Jodhpur." },
                  ].map(s => (
                    <div key={s.n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 24, alignItems: "start", paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
                      <div style={{ fontSize: 13, color: "var(--accent)", letterSpacing: 0.04, fontFeatureSettings: '"tnum"' }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize: 18, marginBottom: 6 }}>{s.t}</div>
                        <div style={{ fontSize: 14, color: "var(--ink-3)" }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ marginTop: 32 }} onClick={() => navigate("shop")}>Begin your album</button>
              </div>
              <div style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
                <SmartImage src={STOCK.craft} alt="bindery" className="img-fill" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRAFT STORY */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ aspectRatio: "4/5", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
                <SmartImage src={STOCK.craftBindery} alt="bindery hands" className="img-fill" />
              </div>
              <div style={{ position: "absolute", bottom: 24, right: -24, width: 240, aspectRatio: "1", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.25)" }}>
                <SmartImage src={STOCK.leather} alt="leather binding" className="img-fill" />
              </div>
            </div>
            <div>
              <span className="eyebrow">Our craft</span>
              <h2 className="headline" style={{ marginTop: 12, marginBottom: 24 }}>
                A practice that<br/><em className="serif-italic">refuses to hurry.</em>
              </h2>
              <p className="lede" style={{ marginBottom: 16 }}>
                In a small workshop in Jodhpur, six binders work in the same patient rhythm their families have for three generations — folding signatures, stitching spines, finishing covers in linen, leather and block-printed silk.
              </p>
              <p className="lede" style={{ marginBottom: 32 }}>
                Each book is checked twice in Sydney before it ships, and again in Rajasthan before it travels. We don't rush. Neither should your memories.
              </p>
              <a className="btn btn-ghost" onClick={() => navigate("about")}>Read our story →</a>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN STUDIO PREVIEW */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <div style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: "var(--r-xl)", padding: 64, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.5, background: "radial-gradient(800px 500px at 80% 20%, rgba(154,107,63,0.35), transparent), radial-gradient(700px 500px at 10% 90%, rgba(122,133,105,0.18), transparent)" }} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }}>
              <div>
                <span className="eyebrow" style={{ color: "var(--accent-2)" }}>Design Studio</span>
                <h2 className="headline" style={{ marginTop: 12, marginBottom: 24, color: "var(--bg)" }}>
                  A quiet, drag-and-drop<br/>book editor.
                </h2>
                <p className="lede" style={{ color: "rgba(244,239,230,0.75)", marginBottom: 32 }}>
                  Choose from over 40 spread layouts, autofill a draft from your photos, refine each page. Save and return any time. We design with you, not for you.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-accent" onClick={() => navigate("studio")}>Open the Studio</button>
                  <button className="btn btn-ghost" style={{ color: "var(--bg)", borderColor: "rgba(244,239,230,0.3)" }} onClick={() => navigate("about")}>Or, let us design it →</button>
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <StudioPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48 }}>
            <div>
              <span className="eyebrow">Letters from our families</span>
              <h2 className="headline" style={{ marginTop: 12 }}>What people say.</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card lift" style={{ padding: 32 }}>
                <Stars rating={t.rating} size={14} />
                <p style={{ marginTop: 20, marginBottom: 32, fontSize: 17, lineHeight: 1.5, letterSpacing: "-0.01em", color: "var(--ink-2)" }}>
                  "{t.quote}"
                </p>
                <hr className="hr" />
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14 }}>{t.author}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.location}</div>
                  </div>
                  <div className="tag">{t.product}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL TEASER */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48 }}>
            <div>
              <span className="eyebrow">From the Journal</span>
              <h2 className="headline" style={{ marginTop: 12 }}>Notes & essays.</h2>
            </div>
            <a className="btn btn-ghost" onClick={() => navigate("blog")}>All entries →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 24 }}>
            <ArticleCard featured title="A short history of the Indian photo album" excerpt="From hand-painted miniatures in the Mughal courts to the leather-bound family books of the 20th century — the keepsake has always belonged to us." image={STOCK.travelTaj} category="Heritage" date="Apr 2026" navigate={navigate} />
            <ArticleCard title="How to choose your photographs" excerpt="A guide to editing a wedding archive of 4,000 photos down to a 60-page album." image={STOCK.weddingFlowers} category="Guides" date="Mar 2026" navigate={navigate} />
            <ArticleCard title="Inside our Jodhpur bindery" excerpt="A morning with the team who hand-stitch every book." image={STOCK.craft} category="Studio" date="Feb 2026" navigate={navigate} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="container">
          <div style={{ background: "var(--bg-2)", borderRadius: "var(--r-xl)", padding: "80px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div className="gradient-blob" style={{ opacity: 0.5 }} />
            <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
              <span className="eyebrow">Begin</span>
              <h2 className="display" style={{ marginTop: 12, marginBottom: 28, fontSize: "clamp(48px, 6vw, 88px)" }}>
                Make something<br/><em className="serif-italic">heirloom.</em>
              </h2>
              <p className="lede" style={{ marginBottom: 32 }}>
                Free shipping across Australia on orders over $400 AUD. Made-to-order in 4–6 weeks.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("shop")}>Start your album</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ Hero variants ============
function HeroImage({ navigate }) {
  return (
    <section style={{ position: "relative", padding: "60px 0 120px", overflow: "hidden" }}>
      <div className="gradient-blob" />
      <div className="container" style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "8px 14px", borderRadius: "var(--r-pill)", background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <span className="dot-pulse" style={{ background: "var(--accent)" }}></span>
              <span style={{ fontSize: 12, letterSpacing: 0.02 }}>Now accepting orders for May & June</span>
            </div>
            <h1 className="display">
              Stories,<br/>
              bound by<br/>
              <em className="serif-italic" style={{ color: "var(--accent-deep)" }}>hand.</em>
            </h1>
            <p className="lede" style={{ marginTop: 32, marginBottom: 40, maxWidth: 520 }}>
              Heirloom photo books and albums, made-to-order between Sydney and Jodhpur. Designed by you, in our studio. Reviewed by us, before they travel.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("shop")}>
                Browse the collection
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate("studio")}>Try the Studio</button>
            </div>
            <div style={{ marginTop: 48, display: "flex", gap: 32, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 24, letterSpacing: "-0.02em" }}>4.9</div>
                <Stars rating={5} size={11} />
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>2,703 reviews</div>
              </div>
              <div style={{ width: 1, height: 40, background: "var(--line)" }}></div>
              <div>
                <div style={{ fontSize: 24, letterSpacing: "-0.02em" }}>10k+</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Albums delivered</div>
              </div>
              <div style={{ width: 1, height: 40, background: "var(--line)" }}></div>
              <div>
                <div style={{ fontSize: 24, letterSpacing: "-0.02em" }}>3</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Generations of binders</div>
              </div>
            </div>
          </div>
          <div style={{ position: "relative", aspectRatio: "4/5" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "0 40px 80px -20px rgba(60,40,20,0.3)" }}>
              <SmartImage src={STOCK.weddingCouple} alt="wedding couple" className="img-fill" />
            </div>
            <div style={{ position: "absolute", left: -32, bottom: 32, width: 200, aspectRatio: "3/4", borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.3)", transform: "rotate(-4deg)", border: "8px solid white" }}>
              <SmartImage src={STOCK.weddingHenna} alt="henna" className="img-fill" />
            </div>
            <div style={{ position: "absolute", right: -16, top: 60, padding: "16px 18px", background: "var(--paper)", borderRadius: "var(--r-md)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)", maxWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span className="dot-pulse" style={{ background: "var(--ok)" }}></span>
                <span style={{ fontSize: 11, letterSpacing: 0.04, textTransform:"uppercase", color: "var(--muted)" }}>Studio status</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>"Anika's Folio is being block-printed today."</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroType({ navigate }) {
  return (
    <section style={{ padding: "80px 0 120px", borderBottom: "1px solid var(--line)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 1100, margin: "0 auto" }}>
          <span className="eyebrow">Safarnama · est. Sydney 2019</span>
          <h1 style={{ fontSize: "clamp(72px, 12vw, 200px)", lineHeight: 0.92, letterSpacing: "-0.05em", margin: "32px 0", fontWeight: 300 }}>
            Stories,<br/>bound by <em className="serif-italic" style={{ color: "var(--accent-deep)" }}>hand.</em>
          </h1>
          <p className="lede" style={{ maxWidth: 560, margin: "0 auto 40px" }}>
            Heirloom photo books and albums, made-to-order between Sydney and Jodhpur. Designed in our Studio. Reviewed before they travel.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("shop")}>Browse the collection</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate("studio")}>Try the Studio</button>
          </div>
        </div>
        <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[STOCK.weddingCouple, STOCK.craft, STOCK.weddingHenna].map((src, i) => (
            <div key={i} style={{ aspectRatio: i === 1 ? "1" : "3/4", borderRadius: "var(--r-lg)", overflow: "hidden", marginTop: i === 1 ? 0 : i === 0 ? 40 : 80 }}>
              <SmartImage src={src} alt="" className="img-fill" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Product Card ============
function ProductCard({ product, navigate, variant = "tall", index = 0 }) {
  return (
    <div className="lift" style={{ cursor: "pointer", display: "flex", flexDirection: "column" }} onClick={() => navigate("product", { slug: product.slug })}>
      <div style={{ position: "relative", aspectRatio: variant === "wide" ? "4/3" : "3/4", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg-3)" }}>
        <SmartImage src={product.image} alt={product.name} className="img-fill" />
        {product.badge && (
          <span style={{ position: "absolute", top: 16, left: 16 }} className="tag dark">{product.badge}</span>
        )}
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button className="icon-btn" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" }} onClick={(e) => { e.stopPropagation(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
      <div style={{ padding: "20px 4px 0", display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 6 }}>{product.tier}</div>
          <h3 style={{ fontSize: 20, margin: "0 0 4px", letterSpacing: "-0.015em", fontWeight: 500 }}>{product.name}</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, lineHeight: 1.4 }}>{product.tagline}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, letterSpacing: "-0.01em" }}>${product.price}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>AUD</div>
        </div>
      </div>
      <div style={{ padding: "12px 4px 0", display: "flex", gap: 6, alignItems: "center" }}>
        <Stars rating={product.rating} size={11} />
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{product.rating} · {product.reviews}</span>
      </div>
    </div>
  );
}

// ============ Article Card ============
function ArticleCard({ title, excerpt, image, category, date, featured, navigate }) {
  return (
    <article className="lift" style={{ display: "flex", flexDirection: "column", cursor: "pointer" }} onClick={() => navigate("article")}>
      <div style={{ aspectRatio: featured ? "4/3" : "3/2", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: 20 }}>
        <SmartImage src={image} alt={title} className="img-fill" />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <span className="tag accent">{category}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{date}</span>
      </div>
      <h3 style={{ fontSize: featured ? 28 : 20, letterSpacing: "-0.02em", margin: "0 0 10px", fontWeight: 500, lineHeight: 1.15 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0, lineHeight: 1.5 }}>{excerpt}</p>
    </article>
  );
}

// ============ Studio Preview (mini animated mockup) ============
function StudioPreview() {
  return (
    <div style={{ background: "var(--paper)", borderRadius: "var(--r-lg)", padding: 16, boxShadow: "0 30px 60px -15px rgba(0,0,0,0.4)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E4DBC9" }}></span>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E4DBC9" }}></span>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E4DBC9" }}></span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="dot-pulse" style={{ background: "var(--ok)", width: 6, height: 6 }}></span>
          Saved · Page 4 of 60
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>$549 AUD</div>
      </div>
      {/* Spread */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 16, background: "var(--bg)", borderRadius: 8 }}>
        <div style={{ aspectRatio: "3/4", display: "grid", gridTemplateRows: "2fr 1fr", gap: 6 }}>
          <div style={{ borderRadius: 4, overflow: "hidden" }}><SmartImage src={STOCK.weddingHands} className="img-fill" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ borderRadius: 4, overflow: "hidden" }}><SmartImage src={STOCK.weddingFlowers} className="img-fill" /></div>
            <div style={{ borderRadius: 4, overflow: "hidden" }}><SmartImage src={STOCK.weddingMandap} className="img-fill" /></div>
          </div>
        </div>
        <div style={{ aspectRatio: "3/4", borderRadius: 4, overflow: "hidden" }}>
          <SmartImage src={STOCK.weddingBride} className="img-fill" />
        </div>
      </div>
      {/* Layout strip */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto" }}>
        {[0,1,2,3,4,5,6].map(i => (
          <div key={i} style={{ width: 38, height: 30, borderRadius: 4, border: i === 1 ? "1.5px solid var(--accent)" : "1px solid var(--line)", flexShrink: 0, padding: 3, background: i === 1 ? "var(--bg-2)" : "var(--paper)" }}>
            <div style={{ display: "grid", gridTemplateColumns: i === 0 ? "1fr" : "1fr 1fr", gap: 1.5, height: "100%" }}>
              <div style={{ background: "var(--bg-3)", borderRadius: 1 }}></div>
              {i > 0 && <div style={{ background: "var(--bg-3)", borderRadius: 1 }}></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, ProductCard, ArticleCard, StudioPreview, HeroImage, HeroType });


// ===== page-shop.jsx =====
// Shop / PLP and Product Detail page
function ShopPage({ navigate, tweaks }) {
  const { products } = useProducts();
  const [filters, setFilters] = useState({ tier: "All", sort: "Featured" });
  const [view, setView] = useState("grid");

  const tiers = ["All", ...new Set(products.map(p => p.tier).filter(Boolean))];
  const filtered = filters.tier === "All" ? products : products.filter(p => p.tier === filters.tier);
  const sorted = [...filtered].sort((a, b) => {
    if (filters.sort === "Price: Low") return a.price - b.price;
    if (filters.sort === "Price: High") return b.price - a.price;
    if (filters.sort === "Rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="shop-page">
      {/* Header */}
      <section style={{ padding: "60px 0 40px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 12, marginBottom: 24 }}>
            <a onClick={() => navigate("home")} style={{ cursor: "pointer" }}>Home</a>
            <span>/</span>
            <span>Shop</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "end" }}>
            <div>
              <span className="eyebrow">The Collection</span>
              <h1 className="headline" style={{ marginTop: 12, maxWidth: 720 }}>
                Eight albums, in three tiers — <em className="serif-italic">Petite, Signature, Heritage.</em>
              </h1>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{sorted.length} products</div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section style={{ padding: "20px 0 40px", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", position: "sticky", top: 96, zIndex: 10, background: "rgba(244,239,230,0.92)", backdropFilter: "blur(10px)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {tiers.map(t => (
              <button key={t} className={`tag ${filters.tier === t ? "dark" : ""}`} style={{ cursor: "pointer", padding: "8px 14px" }} onClick={() => setFilters({...filters, tier: t})}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <FilterPopover />
            <select className="select" style={{ width: "auto", padding: "8px 14px", fontSize: 13 }} value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})}>
              <option>Featured</option>
              <option>Price: Low</option>
              <option>Price: High</option>
              <option>Rating</option>
            </select>
            <div style={{ display: "flex", border: "1px solid var(--line-2)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
              <button onClick={() => setView("grid")} style={{ padding: "8px 12px", background: view === "grid" ? "var(--ink)" : "transparent", color: view === "grid" ? "var(--paper)" : "var(--ink)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button onClick={() => setView("list")} style={{ padding: "8px 12px", background: view === "list" ? "var(--ink)" : "transparent", color: view === "list" ? "var(--paper)" : "var(--ink)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container">
          {view === "grid" ? (
            <div className="products-grid-tall">
              {sorted.map((p, i) => <ProductCard key={p.slug} product={p} navigate={navigate} variant={tweaks.cardStyle || "tall"} index={i} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {sorted.map(p => <ProductRow key={p.slug} product={p} navigate={navigate} />)}
            </div>
          )}
        </div>
      </section>

      {/* Comparison */}
      <ComparisonTable />
    </div>
  );
}

function FilterPopover() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} style={{ display: "inline-flex", gap: 6 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
        Filter
      </button>
      {open && (
        <div className="card fade-in" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, padding: 20, zIndex: 20, boxShadow: "0 20px 50px -10px rgba(0,0,0,0.15)" }}>
          {[
            { label: "Cover material", opts: ["Linen", "Full-grain leather", "Block-printed silk", "Vegan-leather"] },
            { label: "Paper", opts: ["Matte 200gsm", "Pearl 250gsm", "Cotton rag 300gsm"] },
            { label: "Page count", opts: ["20–40", "40–60", "60–80", "80+"] },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.04, textTransform: "uppercase", marginBottom: 10 }}>{s.label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.opts.map(o => <button key={o} className="tag" style={{ cursor: "pointer" }}>{o}</button>)}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setOpen(false)}>Reset</button>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setOpen(false)}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, navigate }) {
  return (
    <div className="card lift" style={{ display: "grid", gridTemplateColumns: "240px 1fr auto", gap: 28, padding: 16, alignItems: "center", cursor: "pointer" }} onClick={() => navigate("product", { slug: product.slug })}>
      <div style={{ aspectRatio: "4/3", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        <SmartImage src={product.image} className="img-fill" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 6 }}>{product.tier}</div>
        <h3 style={{ fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.015em" }}>{product.name}</h3>
        <p style={{ fontSize: 14, color: "var(--ink-3)", margin: "0 0 12px" }}>{product.tagline}</p>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
          <span>{product.sizes.join(" · ")}</span>
          <span>·</span>
          <span>{product.pages[0]}–{product.pages[product.pages.length-1]} pages</span>
          <span>·</span>
          <span>{product.cover.length} cover options</span>
        </div>
      </div>
      <div style={{ textAlign: "right", paddingRight: 24 }}>
        <div style={{ fontSize: 20, letterSpacing: "-0.01em" }}>${product.price}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>AUD</div>
        <Stars rating={product.rating} size={12} />
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{product.reviews} reviews</div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <section style={{ padding: "60px 0 100px", background: "var(--bg-2)" }}>
      <div className="container">
        <span className="eyebrow">Compare</span>
        <h2 className="headline" style={{ marginTop: 12, marginBottom: 40 }}>Find the right book.</h2>
        <div style={{ background: "var(--paper)", borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--line)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--bg-3)" }}>
                <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 12, letterSpacing: 0.06, textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>Tier</th>
                <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 14, fontWeight: 500 }}>Petite</th>
                <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 14, fontWeight: 500 }}>Signature</th>
                <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 14, fontWeight: 500 }}>Heritage</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sizes", "5×7, 6×6 in", "8×8, 10×10, 12×9 in", "11×11, 12×12, 14×11 in"],
                ["Pages", "20–40", "30–80", "40–100"],
                ["Paper", "Matte 200gsm", "Matte 200gsm, Pearl 250gsm", "Pearl 250gsm, Cotton rag 300gsm"],
                ["Cover", "Linen, block-print", "Linen, leather, silk", "Full leather, brocade, silk"],
                ["Binding", "Layflat", "Layflat", "Hand-stitched, layflat"],
                ["Slipcase", "—", "Optional", "Included"],
                ["Production", "3 weeks", "4 weeks", "6 weeks"],
                ["Price (AUD)", "from $399", "from $419", "from $549"],
              ].map((row, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "16px 24px", color: j === 0 ? "var(--muted)" : "var(--ink-2)", fontSize: j === 0 ? 12 : 14, letterSpacing: j === 0 ? 0.04 : "-0.005em", textTransform: j === 0 ? "uppercase" : "none" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ============ Product Detail ============
function ProductPage({ navigate, params, onAddToCart }) {
  const { products } = useProducts();
  const product = products.find(p => p.slug === params?.slug) || products[0];
  const [size, setSize] = useState(product.sizes[0]);
  const [pages, setPages] = useState(product.pages[1] || product.pages[0]);
  const [cover, setCover] = useState(product.cover[0]);
  const [paper, setPaper] = useState(product.paper[0]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const addedTimer = useRef(null);
  const addingTimer = useRef(null);

  useEffect(() => {
    setSize(product.sizes[0]);
    setPages(product.pages[1] || product.pages[0]);
    setCover(product.cover[0]);
    setPaper(product.paper[0]);
    setActiveImg(0);
    setAdded(false);
    setAdding(false);
  }, [product.slug]);

  useEffect(() => () => {
    clearTimeout(addedTimer.current);
    clearTimeout(addingTimer.current);
  }, []);

  const selectedVariant = findMatchingVariant(product, { size, pages, cover, paper });
  const unitPrice = selectedVariant?.price || getConfiguredUnitPrice(product, pages, cover);
  const total = unitPrice * qty;
  const addCurrentSelectionToCart = () => {
    if (adding) return;
    clearTimeout(addedTimer.current);
    clearTimeout(addingTimer.current);
    setAdding(true);
    setAdded(false);

    addingTimer.current = setTimeout(() => {
      onAddToCart(buildCartItem({ product, size, pages, cover, paper, qty }));
      setAdding(false);
      setAdded(true);
      addedTimer.current = setTimeout(() => setAdded(false), 4200);
    }, 650);
  };

  return (
    <div className="product-page">
      <section style={{ padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 12, marginBottom: 32 }}>
            <a onClick={() => navigate("home")} style={{ cursor: "pointer" }}>Home</a>
            <span>/</span>
            <a onClick={() => navigate("shop")} style={{ cursor: "pointer" }}>Shop</a>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80 }}>
            {/* Gallery */}
            <div>
              <div style={{ aspectRatio: "1", borderRadius: "var(--r-xl)", overflow: "hidden", marginBottom: 16, position: "relative" }}>
                <SmartImage src={product.images[activeImg]} alt={product.name} className="img-fill" />
                {product.badge && <span className="tag dark" style={{ position: "absolute", top: 24, left: 24 }}>{product.badge}</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${product.images.length}, 1fr)`, gap: 12 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{ aspectRatio: "1", borderRadius: "var(--r-md)", overflow: "hidden", border: i === activeImg ? "2px solid var(--ink)" : "2px solid transparent", padding: 0, background: "transparent" }}>
                    <SmartImage src={img} className="img-fill" />
                  </button>
                ))}
              </div>
            </div>

            {/* Configurator */}
            <div style={{ position: "sticky", top: 120, alignSelf: "start" }}>
              <div style={{ fontSize: 11, color: "var(--accent-deep)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>{product.tier} · Hand-bound in Jodhpur</div>
              <h1 className="headline" style={{ marginBottom: 14, fontSize: "clamp(36px, 4vw, 52px)" }}>{product.name}</h1>
              <p className="lede" style={{ marginBottom: 20 }}>{product.tagline}</p>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
                <Stars rating={product.rating} size={14} />
                <span style={{ fontSize: 13 }}>{product.rating} · {product.reviews} reviews</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>·</span>
                <a style={{ fontSize: 13, color: "var(--accent-deep)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Read all reviews</a>
              </div>

              <Configurator
                product={product}
                size={size} setSize={setSize}
                pages={pages} setPages={setPages}
                cover={cover} setCover={setCover}
                paper={paper} setPaper={setPaper}
                qty={qty} setQty={setQty}
              />

              <div style={{ marginTop: 32, padding: 24, background: "var(--bg-2)", borderRadius: "var(--r-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.04, textTransform: "uppercase" }}>Total</div>
                  <div style={{ fontSize: 36, letterSpacing: "-0.025em", lineHeight: 1, marginTop: 6 }}>{formatCurrency(total, product.currency)}<span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 6 }}>{product.currency || "AUD"}</span></div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>or 4 × {formatCurrency(Math.round(total/4), product.currency)} with Afterpay</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn btn-primary btn-lg" onClick={() => navigate("upload", { slug: product.slug, size, pages, cover, paper, qty })}>
                    Begin uploading →
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={addCurrentSelectionToCart} disabled={adding} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: adding ? 0.78 : 1 }}>
                    {adding && <span className="spinner" aria-hidden="true"></span>}
                    {adding ? "Adding..." : added ? "Added to cart" : "Add to cart for later"}
                  </button>
                </div>
              </div>
              {added && (
                <div className="fade-in" style={{ marginTop: 12, padding: "12px 14px", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", background: "var(--paper)", display: "flex", gap: 10, alignItems: "start", fontSize: 13, color: "var(--ink-3)" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--ok)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>✓</span>
                  <div>
                    <strong style={{ color: "var(--ink)" }}>Added to cart.</strong>
                    <div style={{ marginTop: 2 }}>{qty} × {product.name} · {size} · {pages} pages · {cover} · {paper}</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, color: "var(--ink-3)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <span style={{ marginTop: 2 }}>✓</span>
                  <div><strong>Free shipping</strong><br/><span style={{ color: "var(--muted)", fontSize: 12 }}>Across Australia, orders $400+</span></div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <span style={{ marginTop: 2 }}>✓</span>
                  <div><strong>4–6 week production</strong><br/><span style={{ color: "var(--muted)", fontSize: 12 }}>From upload to your door</span></div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <span style={{ marginTop: 2 }}>✓</span>
                  <div><strong>Reviewed by hand</strong><br/><span style={{ color: "var(--muted)", fontSize: 12 }}>By our Sydney team, before printing</span></div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <span style={{ marginTop: 2 }}>✓</span>
                  <div><strong>Lifetime binding</strong><br/><span style={{ color: "var(--muted)", fontSize: 12 }}>Repaired free, forever</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details accordions */}
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container-narrow">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
            <div>
              <span className="eyebrow">In detail</span>
              <h2 className="headline" style={{ marginTop: 12, marginBottom: 32, fontSize: "clamp(32px, 3.4vw, 44px)" }}>The making of the {product.name}.</h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-3)", marginBottom: 16 }}>
                Each {product.name} is hand-bound by our six-person team in Jodhpur. We fold the signatures by hand, sew the spine on a French frame, and finish the cover in your chosen material before pressing it for 24 hours.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-3)" }}>
                The paper is sourced from a small mill in Coimbatore, archival-grade and acid-free, so your photographs hold their colour for a hundred years. The result lies perfectly flat — no spine break, no compromise across the gutter.
              </p>
            </div>
            <div>
              {[
                { q: "Specifications", a: `Size: ${product.sizes.join(', ')}\nPages: ${product.pages.join(', ')}\nPaper: ${product.paper.join(', ')}\nCover: ${product.cover.join(', ')}\nBinding: Hand-stitched, layflat\nWeight: 1.2–2.4kg depending on size` },
                { q: "Photo requirements", a: "We accept JPG, PNG, TIFF and HEIC at minimum 300 DPI. Our Studio will warn you about any image that won't print cleanly. We recommend the longest edge be at least 3000px for full-bleed pages." },
                { q: "Production & shipping", a: "Each book is made-to-order in 4–6 weeks from order confirmation. Standard shipping to Australia is free for orders over $400. Express delivery is available at checkout." },
                { q: "Returns & guarantee", a: "Because every book is bespoke, we don't accept returns. We do however guarantee the binding for life — if it ever loosens, we'll repair it free of charge. Send us a note and we'll arrange the return shipping." },
              ].map((item, i) => (
                <Accordion key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* You might also like */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="container">
          <h2 className="headline" style={{ marginBottom: 40, fontSize: "clamp(28px, 3vw, 40px)" }}>You might also like</h2>
          <div className="products-grid-tall">
            {products.filter(p => p.slug !== product.slug).slice(0, 4).map(p => <ProductCard key={p.slug} product={p} navigate={navigate} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Configurator({ product, size, setSize, pages, setPages, cover, setCover, paper, setPaper, qty, setQty }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ConfigGroup label="Size">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {product.sizes.map(s => <ConfigPill key={s} active={size === s} onClick={() => setSize(s)}>{s}</ConfigPill>)}
        </div>
      </ConfigGroup>
      <ConfigGroup label="Pages">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {product.pages.map(p => <ConfigPill key={p} active={pages === p} onClick={() => setPages(p)}>{p} pages</ConfigPill>)}
        </div>
      </ConfigGroup>
      <ConfigGroup label="Cover">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {product.cover.map(c => (
            <button key={c} onClick={() => setCover(c)} className={cover === c ? "" : ""} style={{ padding: "14px 16px", borderRadius: "var(--r-md)", border: cover === c ? "1.5px solid var(--ink)" : "1px solid var(--line-2)", background: cover === c ? "var(--bg-2)" : "var(--paper)", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: c.includes("leather") ? "#6F4A2A" : c.includes("silk") || c.includes("Brocade") ? "#7A2A2A" : c.includes("cotton") ? "#9A6B3F" : "#E4DBC9", flexShrink: 0 }}></span>
              <span style={{ fontSize: 13 }}>{c}</span>
            </button>
          ))}
        </div>
      </ConfigGroup>
      <ConfigGroup label="Paper">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {product.paper.map(p => <ConfigPill key={p} active={paper === p} onClick={() => setPaper(p)}>{p}</ConfigPill>)}
        </div>
      </ConfigGroup>
      <ConfigGroup label="Quantity">
        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: "var(--r-pill)" }}>
          <button onClick={() => setQty(Math.max(1, qty-1))} style={{ width: 38, height: 38, fontSize: 16 }}>−</button>
          <span style={{ width: 40, textAlign: "center", fontSize: 14 }}>{qty}</span>
          <button onClick={() => setQty(qty+1)} style={{ width: 38, height: 38, fontSize: 16 }}>+</button>
          {qty >= 5 && <span style={{ fontSize: 12, color: "var(--accent-deep)", marginLeft: 12, paddingRight: 14 }}>Bulk discount applied · 10% off</span>}
        </div>
      </ConfigGroup>
    </div>
  );
}

function ConfigGroup({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.04, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function ConfigPill({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 16px", borderRadius: "var(--r-pill)",
      border: active ? "1.5px solid var(--ink)" : "1px solid var(--line-2)",
      background: active ? "var(--ink)" : "var(--paper)",
      color: active ? "var(--paper)" : "var(--ink)",
      fontSize: 13, cursor: "pointer", transition: "all 0.2s",
    }}>{children}</button>
  );
}

function Accordion({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: "20px 0" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", padding: 0 }}>
        <span style={{ fontSize: 16, letterSpacing: "-0.01em" }}>{q}</span>
        <span style={{ fontSize: 18, color: "var(--muted)", transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.3s" }}>+</span>
      </button>
      {open && (
        <div className="fade-in" style={{ marginTop: 16, fontSize: 14, color: "var(--ink-3)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{a}</div>
      )}
    </div>
  );
}

Object.assign(window, { ShopPage, ProductPage, ProductRow, FilterPopover, ComparisonTable, Configurator, Accordion });


// ===== page-studio.jsx =====
// Studio upload and editor pages moved to src/pages/studio/StudioPage.jsx




// ===== page-cart-checkout.jsx =====
// Cart, Checkout, Confirmation, Account
function CartPage({ navigate, items, setItems }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal > 400 ? 0 : 25;
  const total = subtotal + shipping;
  const totalItems = cartItemCount(items);
  const handleShopifyCheckout = async () => {
    if (!items.length || checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const checkoutUrl = await createShopifyCheckout(items);
      window.location.href = checkoutUrl;
    } catch (err) {
      setCheckoutError(err.message || "Unable to start Shopify checkout.");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40 }}>
            <div>
              <span className="eyebrow">Your projects</span>
              <h1 className="headline" style={{ marginTop: 12 }}>Cart · {totalItems} {totalItems === 1 ? "book" : "books"} in progress.</h1>
            </div>
            <a className="btn btn-ghost" onClick={() => navigate("shop")}>← Continue shopping</a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 60 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.length ? (
                <>
                  {items.map(item => (
                    <CartItem key={item.id} item={item} navigate={navigate} setItems={setItems} items={items} />
                  ))}

                  <div style={{ marginTop: 24, padding: 24, background: "var(--bg-2)", borderRadius: "var(--r-md)", display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, marginBottom: 2 }}>Add a personalised slipcase to any Heritage book</div>
                      <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Foiled with the title of your choice. +$80 AUD.</div>
                    </div>
                    <button className="btn btn-ghost btn-sm">Add to order</button>
                  </div>
                </>
              ) : (
                <div className="card" style={{ padding: 48, minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5h2.5l2.5 11h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
                  </div>
                  <h2 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Your cart is empty.</h2>
                  <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: 420, lineHeight: 1.6, margin: "0 0 24px" }}>Choose a book, select the details that feel right, and it will appear here ready for upload or checkout.</p>
                  <button className="btn btn-primary" onClick={() => navigate("shop")}>Browse books</button>
                </div>
              )}
            </div>

            <aside style={{ position: "sticky", top: 120, alignSelf: "start" }}>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 18, margin: "0 0 20px", letterSpacing: "-0.015em" }}>Order summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, marginBottom: 20 }}>
                  <SummaryRow label={`Subtotal (${totalItems} ${totalItems === 1 ? "item" : "items"})`} value={formatCurrency(subtotal)} />
                  <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : formatCurrency(shipping)} note={subtotal > 400 ? "On orders over $400" : ""} />
                  <SummaryRow label="Estimated GST" value="Included" />
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--line)", marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14 }}>Total</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 32, letterSpacing: "-0.025em", lineHeight: 1 }}>{formatCurrency(total)}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>AUD · or 4 × {formatCurrency(Math.round(total/4))} with Afterpay</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" placeholder="Promo code" style={{ flex: 1 }} />
                    <button className="btn btn-ghost">Apply</button>
                  </div>
                </div>
                {checkoutError && (
                  <div className="fade-in" style={{ marginBottom: 14, padding: "10px 12px", borderRadius: "var(--r-sm)", border: "1px solid rgba(168,87,48,0.25)", background: "rgba(168,87,48,0.08)", color: "var(--rust)", fontSize: 12, lineHeight: 1.45 }}>
                    {checkoutError}
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  disabled={!items.length || checkoutLoading}
                  style={{ width: "100%", opacity: items.length ? 1 : 0.45, pointerEvents: items.length ? "auto" : "none", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                  onClick={handleShopifyCheckout}
                >
                  {checkoutLoading && <span className="spinner" aria-hidden="true"></span>}
                  {checkoutLoading ? "Opening Shopify checkout..." : "Proceed to Shopify checkout →"}
                </button>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 14, fontSize: 11, color: "var(--muted)" }}>
                  <span>🔒 Secure checkout</span>
                  <span>·</span>
                  <span>Shopify</span>
                  <span>·</span>
                  <span>Tracked order</span>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 20, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--ink)" }}>Made-to-order in Jodhpur.</strong><br/>
                Production begins after Sydney review. Allow 4–6 weeks before dispatch.
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function CartItem({ item, navigate, setItems, items }) {
  const isTeamDesign = Boolean(item.professionalDesignRequest?.requested);
  const statusColor = item.status === "Designed" ? "var(--ok)" : item.status === "In studio" || isTeamDesign ? "var(--accent)" : "var(--muted)";
  const designSummary = isTeamDesign ? `${item.professionalDesignRequest?.assets?.length || 0} uploaded photos · team design requested` : item.albumDesign ? `${item.albumDesign.spreadCount} spreads · ${item.albumDesign.pageCount} pages` : "No saved design";
  return (
    <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 24 }}>
      <div style={{ aspectRatio: "1", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        <SmartImage src={item.thumb} className="img-fill" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 4 }}>{item.tier || "Album"} · {item.project}</div>
        <h3 style={{ fontSize: 20, margin: "0 0 6px", letterSpacing: "-0.015em" }}>{item.name}</h3>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>{item.config}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {[
            item.details?.size,
            item.details?.pages ? `${item.details.pages} pages` : "",
            item.details?.cover,
            item.details?.paper,
          ].filter(Boolean).map(detail => (
            <span key={detail} className="tag" style={{ fontSize: 11 }}>{detail}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }}></span>
          <span style={{ fontSize: 12, color: statusColor }}>{item.status}</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>· {designSummary}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isTeamDesign && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("studio", { slug: item.slug, cartItemId: item.id })}>Edit design</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setItems(items.map(i => i.id === item.id ? {...i, qty: i.qty+1} : i))}>Duplicate</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--rust)" }} onClick={() => setItems(items.filter(i => i.id !== item.id))}>Remove</button>
        </div>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 22, letterSpacing: "-0.015em" }}>{formatCurrency(item.price * item.qty, item.currency)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{formatCurrency(item.price, item.currency)} × {item.qty}</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: "var(--r-pill)" }}>
          <button onClick={() => setItems(items.map(i => i.id === item.id ? {...i, qty: Math.max(1, i.qty-1)} : i))} style={{ width: 32, height: 32 }}>−</button>
          <span style={{ width: 28, textAlign: "center", fontSize: 13 }}>{item.qty}</span>
          <button onClick={() => setItems(items.map(i => i.id === item.id ? {...i, qty: i.qty+1} : i))} style={{ width: 32, height: 32 }}>+</button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ color: "var(--ink-3)" }}>{label}</span>
      <span style={{ textAlign: "right" }}>
        {value}
        {note && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{note}</div>}
      </span>
    </div>
  );
}

// ============ CHECKOUT ============
function CheckoutPage({ navigate, items = [] }) {
  const [step, setStep] = useState("delivery"); // delivery, payment, review
  const [delivery, setDelivery] = useState({
    name: "Priya Sharma", email: "priya@example.com", phone: "+61 412 778 933",
    address: "47 Glebe Point Road", suburb: "Glebe", state: "NSW", postcode: "2037", country: "Australia"
  });
  const [special, setSpecial] = useState("Please include a small note: 'For Mum & Dad — Diwali 2026.' Wrap in our brown paper, no plastic.");
  const [shipping, setShipping] = useState("standard");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = subtotal === 0 || subtotal > 400 ? 0 : 25;
  const total = subtotal + shippingCost;
  const totalItems = cartItemCount(items);

  return (
    <div className="checkout-page">
      <section style={{ padding: "40px 0 120px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <a onClick={() => navigate("home")} style={{ height: 22, cursor: "pointer" }}><Logo /></a>
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--muted)" }}>
              <span>🔒 Secure checkout</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 48 }}>
            {[
              { id: "delivery", n: 1, label: "Delivery & gift note" },
              { id: "payment", n: 2, label: "Payment" },
              { id: "review", n: 3, label: "Review & place order" },
            ].map((s, i, arr) => (
              <React.Fragment key={s.id}>
                <button onClick={() => setStep(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, opacity: arr.findIndex(a => a.id === step) >= i ? 1 : 0.4 }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: step === s.id ? "var(--ink)" : "var(--bg-3)", color: step === s.id ? "var(--paper)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{s.n}</span>
                  <span style={{ fontSize: 14 }}>{s.label}</span>
                </button>
                {i < arr.length - 1 && <span style={{ flex: 1, maxWidth: 60, height: 1, background: "var(--line)" }}></span>}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 60 }}>
            <div>
              {step === "delivery" && (
                <DeliveryStep delivery={delivery} setDelivery={setDelivery} special={special} setSpecial={setSpecial} shipping={shipping} setShipping={setShipping} onNext={() => setStep("payment")} />
              )}
              {step === "payment" && <PaymentStep onNext={() => setStep("review")} onBack={() => setStep("delivery")} />}
              {step === "review" && <ReviewStep delivery={delivery} special={special} shipping={shipping} onBack={() => setStep("payment")} onPlace={() => navigate("confirmation")} />}
            </div>

            <aside style={{ position: "sticky", top: 40, alignSelf: "start" }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 16 }}>{totalItems} {totalItems === 1 ? "book" : "books"} in your order</div>
                {items.length ? (
                  items.map((b) => (
                    <div key={b.id} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "var(--r-sm)", overflow: "hidden", flexShrink: 0 }}>
                        <SmartImage src={b.thumb} className="img-fill" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14 }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{b.config}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Qty {b.qty}</div>
                        {b.albumDesign && (
                          <div style={{ fontSize: 11, color: "var(--accent-deep)", marginTop: 4 }}>
                            Design JSON saved · {b.albumDesign.spreadCount} spreads · {b.albumDesign.pageCount} pages
                          </div>
                        )}
                        {b.professionalDesignRequest?.requested && (
                          <div style={{ fontSize: 11, color: "var(--accent-deep)", marginTop: 4 }}>
                            Team design requested · {b.professionalDesignRequest.assets?.length || 0} uploaded photos
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 14 }}>{formatCurrency(b.price * b.qty, b.currency)}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "28px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.6 }}>
                    Your order is empty. Return to the shop to choose a book before checkout.
                  </div>
                )}
                <hr className="hr" style={{ margin: "16px 0" }} />
                <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                <SummaryRow label="Shipping" value={shippingCost === 0 ? "Free" : formatCurrency(shippingCost)} />
                <SummaryRow label="GST" value="Included" />
                <hr className="hr" style={{ margin: "16px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span>Total</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, letterSpacing: "-0.025em" }}>{formatCurrency(total)}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>AUD</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function DeliveryStep({ delivery, setDelivery, special, setSpecial, shipping, setShipping, onNext }) {
  return (
    <div>
      <h2 className="headline" style={{ fontSize: "clamp(28px, 3vw, 40px)", marginBottom: 28 }}>Where should we send your books?</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Full name"><input className="input" value={delivery.name} onChange={e => setDelivery({...delivery, name: e.target.value})} /></Field>
        <Field label="Email"><input className="input" value={delivery.email} onChange={e => setDelivery({...delivery, email: e.target.value})} /></Field>
        <Field label="Phone"><input className="input" value={delivery.phone} onChange={e => setDelivery({...delivery, phone: e.target.value})} /></Field>
        <Field label="Country"><select className="select" value={delivery.country}><option>Australia</option><option>New Zealand</option><option>India</option><option>United Kingdom</option><option>United States</option></select></Field>
        <Field label="Street address" full><input className="input" value={delivery.address} onChange={e => setDelivery({...delivery, address: e.target.value})} /></Field>
        <Field label="Suburb"><input className="input" value={delivery.suburb} onChange={e => setDelivery({...delivery, suburb: e.target.value})} /></Field>
        <Field label="State"><input className="input" value={delivery.state} onChange={e => setDelivery({...delivery, state: e.target.value})} /></Field>
        <Field label="Postcode"><input className="input" value={delivery.postcode} onChange={e => setDelivery({...delivery, postcode: e.target.value})} /></Field>
      </div>

      <h3 style={{ fontSize: 22, letterSpacing: "-0.015em", margin: "48px 0 20px" }}>Shipping</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { id: "standard", name: "Standard delivery", note: "Free · 4–6 weeks production + 5–7 days transit", price: "Free" },
          { id: "express", name: "Express delivery", note: "+$45 · 3–4 weeks production + 2–3 days transit", price: "$45" },
          { id: "rush", name: "Rush production", note: "+$120 · Designed and bound in 14 days", price: "$120" },
        ].map(o => (
          <button key={o.id} onClick={() => setShipping(o.id)} style={{ padding: 18, borderRadius: "var(--r-md)", border: shipping === o.id ? "1.5px solid var(--ink)" : "1px solid var(--line-2)", background: shipping === o.id ? "var(--bg-2)" : "var(--paper)", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", border: shipping === o.id ? "5px solid var(--ink)" : "1.5px solid var(--line-2)", background: "var(--paper)" }}></span>
              <div>
                <div style={{ fontSize: 15 }}>{o.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{o.note}</div>
              </div>
            </div>
            <div style={{ fontSize: 14 }}>{o.price}</div>
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: 22, letterSpacing: "-0.015em", margin: "48px 0 20px" }}>A special message?</h3>
      <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 16 }}>Optional. We'll write your note by hand in our Sydney studio and tuck it inside the slipcase.</p>
      <textarea className="input" rows="4" value={special} onChange={e => setSpecial(e.target.value)} style={{ resize: "vertical" }}></textarea>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Hand-written on cream card · letterpressed envelope</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{special.length} / 280</span>
      </div>

      <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Continue to payment →</button>
      </div>
    </div>
  );
}

function PaymentStep({ onNext, onBack }) {
  const [method, setMethod] = useState("card");
  return (
    <div>
      <h2 className="headline" style={{ fontSize: "clamp(28px, 3vw, 40px)", marginBottom: 28 }}>Payment</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {[
          { id: "card", name: "Credit or debit card", note: "Visa, Mastercard, Amex" },
          { id: "afterpay", name: "Afterpay", note: "4 interest-free payments of $341.50" },
          { id: "paypal", name: "PayPal", note: "Pay with your PayPal account" },
          { id: "applepay", name: "Apple Pay", note: "Tap to pay" },
        ].map(o => (
          <button key={o.id} onClick={() => setMethod(o.id)} style={{ padding: 18, borderRadius: "var(--r-md)", border: method === o.id ? "1.5px solid var(--ink)" : "1px solid var(--line-2)", background: method === o.id ? "var(--bg-2)" : "var(--paper)", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", border: method === o.id ? "5px solid var(--ink)" : "1.5px solid var(--line-2)", background: "var(--paper)" }}></span>
              <div>
                <div style={{ fontSize: 15 }}>{o.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{o.note}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {method === "card" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Card number" full><input className="input" placeholder="4242 4242 4242 4242" /></Field>
          <Field label="Expiry"><input className="input" placeholder="MM / YY" /></Field>
          <Field label="CVC"><input className="input" placeholder="123" /></Field>
          <Field label="Name on card" full><input className="input" placeholder="Priya Sharma" /></Field>
        </div>
      )}

      <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between" }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Review order →</button>
      </div>
    </div>
  );
}

function ReviewStep({ delivery, special, shipping, onBack, onPlace }) {
  return (
    <div>
      <h2 className="headline" style={{ fontSize: "clamp(28px, 3vw, 40px)", marginBottom: 28 }}>Review your order.</h2>

      <ReviewBlock title="Delivery to">
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {delivery.name}<br/>
          {delivery.address}, {delivery.suburb}<br/>
          {delivery.state} {delivery.postcode}, {delivery.country}<br/>
          <span style={{ color: "var(--muted)" }}>{delivery.email} · {delivery.phone}</span>
        </div>
      </ReviewBlock>

      <ReviewBlock title="Shipping">
        <div style={{ fontSize: 14 }}>{shipping === "rush" ? "Rush production · 14 days" : shipping === "express" ? "Express delivery" : "Standard delivery · Free"}</div>
      </ReviewBlock>

      {special && (
        <ReviewBlock title="Special message">
          <div style={{ fontSize: 14, lineHeight: 1.6, fontStyle: "italic", color: "var(--ink-2)" }}>"{special}"</div>
        </ReviewBlock>
      )}

      <ReviewBlock title="Payment" last>
        <div style={{ fontSize: 14 }}>Visa ending in •••• 4242</div>
      </ReviewBlock>

      <div style={{ marginTop: 40, padding: 24, background: "var(--bg-2)", borderRadius: "var(--r-md)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "start" }}>
          <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
          <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
            I understand that each book is bespoke and made-to-order, and cannot be returned. I have reviewed every page of every project, and I'm happy with the layout, photographs and text.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back to payment</button>
        <button className="btn btn-primary btn-lg" onClick={onPlace}>Place order · $1,366 AUD</button>
      </div>
    </div>
  );
}

function ReviewBlock({ title, children, last }) {
  return (
    <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "span 2" : "auto" }}>
      <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.04, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

// ============ CONFIRMATION ============
function ConfirmationPage({ navigate }) {
  return (
    <div className="confirmation-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container-narrow" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--ok)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>✓</div>
            <span className="eyebrow" style={{ color: "var(--ok)" }}>Order placed</span>
            <h1 className="display" style={{ marginTop: 16, marginBottom: 16, fontSize: "clamp(48px, 6vw, 80px)" }}>
              Thank you, <em className="serif-italic">Priya.</em>
            </h1>
            <p className="lede" style={{ maxWidth: 540, margin: "0 auto" }}>
              Your books are in our care now. We've sent a receipt to <strong>priya@example.com</strong> with everything below.
            </p>
            <div style={{ marginTop: 32, display: "inline-flex", gap: 12, alignItems: "center", padding: "10px 20px", background: "var(--bg-2)", borderRadius: "var(--r-pill)", fontFeatureSettings: '"tnum"' }}>
              <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase" }}>Order</span>
              <span style={{ fontSize: 14, letterSpacing: 0.04 }}>SAF-2026-04188</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="card" style={{ padding: 40, marginBottom: 32 }}>
            <h3 style={{ fontSize: 22, letterSpacing: "-0.015em", marginBottom: 28 }}>What happens next.</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { t: "Today", title: "Order received", note: "Sydney team has begun a hand review of every page of every project.", active: true },
                { t: "In 3 days", title: "Review email", note: "We'll send a final preview PDF for your approval before production." },
                { t: "Days 4–28", title: "Made by hand in Jodhpur", note: "Six binders fold, sew, finish and press your books." },
                { t: "Day 30", title: "Shipped from Sydney", note: "Final QC, then off it goes — we'll text you a tracking link." },
                { t: "Day 35–37", title: "In your hands", note: "Estimated delivery to Glebe, NSW." },
              ].map((s, i, arr) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 28px 1fr", gap: 20, paddingBottom: i === arr.length - 1 ? 0 : 24 }}>
                  <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.04, textTransform: "uppercase", paddingTop: 4 }}>{s.t}</div>
                  <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: s.active ? "var(--accent)" : "var(--line-2)", marginTop: 6, position: "relative", zIndex: 2 }}></span>
                    {i < arr.length - 1 && <span style={{ position: "absolute", top: 18, bottom: -24, width: 1, background: "var(--line-2)" }}></span>}
                  </div>
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 8 }}>Delivering to</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                Priya Sharma<br/>47 Glebe Point Road<br/>Glebe NSW 2037
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 8 }}>Total paid</div>
              <div style={{ fontSize: 22, letterSpacing: "-0.015em" }}>$1,366 AUD</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Visa •••• 4242</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => navigate("account")}>Track this order</button>
            <button className="btn btn-ghost" onClick={() => navigate("home")}>Return home</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ ORDER STATUS ============
function OrderStatusPage({ navigate }) {
  const [orderId, setOrderId] = useState("");
  const [lookup, setLookup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const result = lookup?.order || lookup?.checkout || null;
  const paidOrder = lookup?.order;
  const checkout = lookup?.checkout;
  const statusLabel = paidOrder ? "Order received" : checkout ? "Checkout started" : "Not found";

  const search = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setLookup(null);

    try {
      const data = await fetchOrderStatus(orderId);
      setLookup(data);
    } catch (err) {
      setError(err.message || "Unable to look up that order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-status-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container-narrow">
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 12, marginBottom: 24 }}>
              <a onClick={() => navigate("home")} style={{ cursor: "pointer" }}>Home</a>
              <span>/</span>
              <span>Order status</span>
            </div>
            <span className="eyebrow">Order status</span>
            <h1 className="headline" style={{ marginTop: 12, marginBottom: 16 }}>Track your Safarnama order.</h1>
            <p className="lede" style={{ maxWidth: 680 }}>
              Enter the order ID that begins with <strong>sf-</strong>. You'll find it after checkout starts, and it is also saved with your Shopify order details.
            </p>
          </div>

          <form className="card" onSubmit={search} style={{ padding: 28, marginBottom: 24 }}>
            <Field label="Safarnama order ID">
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  className="input"
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="Enter your order id..."
                  style={{ flex: 1, fontFeatureSettings: '"tnum"' }}
                />
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ minWidth: 150, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {loading && <span className="spinner" aria-hidden="true"></span>}
                  {loading ? "Checking..." : "Check status"}
                </button>
              </div>
            </Field>
            {error && (
              <div className="fade-in" style={{ marginTop: 14, padding: "10px 12px", borderRadius: "var(--r-sm)", border: "1px solid rgba(168,87,48,0.25)", background: "rgba(168,87,48,0.08)", color: "var(--rust)", fontSize: 12, lineHeight: 1.45 }}>
                {error}
              </div>
            )}
          </form>

          {lookup && !lookup.found && (
            <div className="card fade-in" style={{ padding: 48, minHeight: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h2 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 10px" }}>No order found.</h2>
              <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
                We couldn't find anything for <strong style={{ color: "var(--ink)" }}>{lookup.appOrderId}</strong>. Check the ID and try again, or contact us if your payment has already gone through.
              </p>
            </div>
          )}

          {lookup?.found && (
            <div className="card fade-in" style={{ padding: 28, background: "linear-gradient(180deg, var(--paper) 0%, var(--bg-2) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 24, marginBottom: 24 }}>
                <div>
                  <span className={`tag ${paidOrder ? "accent" : ""}`}>{statusLabel}</span>
                  <h2 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "12px 0 4px" }}>{lookup.appOrderId}</h2>
                  <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                    {paidOrder?.orderName ? `${paidOrder.orderName} · ` : ""}{paidOrder ? "Shopify order confirmed" : "Waiting for Shopify purchase confirmation"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{paidOrder ? "Placed" : "Checkout created"}</div>
                  <div style={{ fontSize: 18, letterSpacing: "-0.01em", marginTop: 4 }}>{formatStatusDate(paidOrder?.createdAt || checkout?.createdAt)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 24, padding: "20px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, position: "relative" }}>
                  <div style={{ position: "absolute", top: 18, left: "12%", right: "12%", height: 2, background: "var(--line-2)", zIndex: 0 }}></div>
                  <div style={{ position: "absolute", top: 18, left: "12%", width: paidOrder ? "50%" : "14%", height: 2, background: "var(--accent)", zIndex: 1 }}></div>
                  {["Checkout", "Paid", "Review", "Production"].map((step, i) => {
                    const activeIndex = paidOrder ? 1 : 0;
                    const active = i <= activeIndex;
                    return (
                      <div key={step} style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <span style={{ width: active ? 14 : 10, height: active ? 14 : 10, borderRadius: "50%", background: active ? "var(--accent)" : "var(--paper)", border: active ? "none" : "2px solid var(--line-2)", marginTop: active ? 12 : 14 }}></span>
                        <span style={{ fontSize: 11, color: active ? "var(--ink)" : "var(--muted)", textAlign: "center" }}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <StatusMeta label="Status" value={paidOrder?.financialStatus || checkout?.status || "checkout_created"} />
                <StatusMeta label="Total" value={paidOrder?.totalPrice ? `${paidOrder.currency || "AUD"} ${paidOrder.totalPrice}` : "Available after purchase"} />
                <StatusMeta label="Shopify order" value={paidOrder?.orderName || "Not created yet"} />
                <StatusMeta label="Email" value={paidOrder?.email || "Available after purchase"} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(paidOrder?.lineItems || checkout?.items || []).map((item, index) => (
                  <div key={item.id || index} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start", padding: 16, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--paper)" }}>
                    <div>
                      <div style={{ fontSize: 15, marginBottom: 4 }}>{item.title || item.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                        {item.variantTitle || item.variant_title || "Selected book"}
                        {item.details && ` · ${[item.details.size, item.details.pages ? `${item.details.pages} pages` : "", item.details.cover, item.details.paper].filter(Boolean).join(" · ")}`}
                      </div>
                    </div>
                    <span className="tag">Qty {item.quantity || item.qty || 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatusMeta({ label, value }) {
  return (
    <div style={{ padding: 16, borderRadius: "var(--r-sm)", background: "var(--paper)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 15, color: "var(--ink)", overflowWrap: "anywhere" }}>{value || "Not available"}</div>
    </div>
  );
}

// ============ ACCOUNT ============
function AccountPage({ navigate }) {
  const [tab, setTab] = useState("orders");
  return (
    <div className="account-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <span className="eyebrow">Your account</span>
            <h1 className="headline" style={{ marginTop: 12 }}>Hello, <em className="serif-italic">Priya.</em></h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 60 }}>
            <aside>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { id: "orders", label: "Orders & tracking" },
                  { id: "projects", label: "Saved projects" },
                  { id: "addresses", label: "Addresses" },
                  { id: "details", label: "Account details" },
                  { id: "rewards", label: "Rewards" },
                  { id: "wishlist", label: "Wishlist" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 14px", textAlign: "left", borderRadius: "var(--r-sm)", background: tab === t.id ? "var(--bg-2)" : "transparent", color: tab === t.id ? "var(--ink)" : "var(--ink-3)", fontSize: 14, cursor: "pointer" }}>{t.label}</button>
                ))}
              </div>
              <hr className="hr" style={{ margin: "20px 0" }} />
              <button style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 14 }}>Sign out</button>
            </aside>

            <div>
              {tab === "orders" && <AccountOrders />}
              {tab === "projects" && <AccountProjects navigate={navigate} />}
              {tab !== "orders" && tab !== "projects" && <AccountPlaceholder tab={tab} />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccountOrders() {
  return (
    <div>
      <h2 style={{ fontSize: 28, letterSpacing: "-0.02em", marginBottom: 24 }}>Orders & tracking</h2>

      {/* Active order with timeline */}
      <div className="card" style={{ padding: 28, marginBottom: 16, background: "linear-gradient(180deg, var(--paper) 0%, var(--bg-2) 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
          <div>
            <span className="tag accent">In production</span>
            <h3 style={{ fontSize: 22, letterSpacing: "-0.015em", margin: "10px 0 4px" }}>Order SAF-2026-04188</h3>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>3 books · Placed 4 April 2026 · Total $1,366</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Estimated delivery</div>
            <div style={{ fontSize: 18, letterSpacing: "-0.01em", marginTop: 4 }}>9 May 2026</div>
          </div>
        </div>

        {/* Visual progress */}
        <div style={{ marginBottom: 24, padding: "20px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 18, left: "10%", right: "10%", height: 2, background: "var(--line-2)", zIndex: 0 }}></div>
            <div style={{ position: "absolute", top: 18, left: "10%", width: "30%", height: 2, background: "var(--accent)", zIndex: 1 }}></div>
            {["Reviewed", "In bindery", "Pressing", "Quality check", "Shipping"].map((s, i) => (
              <div key={s} style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ width: i <= 1 ? 14 : 10, height: i <= 1 ? 14 : 10, borderRadius: "50%", background: i <= 1 ? "var(--accent)" : "var(--paper)", border: i <= 1 ? "none" : "2px solid var(--line-2)", marginTop: i <= 1 ? 12 : 14 }}></span>
                <span style={{ fontSize: 11, color: i <= 1 ? "var(--ink)" : "var(--muted)", textAlign: "center" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {[STOCK.weddingCouple, STOCK.travelTaj, STOCK.family].map((src, i) => (
            <div key={i} style={{ width: 76, height: 76, borderRadius: "var(--r-sm)", overflow: "hidden", flexShrink: 0 }}>
              <SmartImage src={src} className="img-fill" />
            </div>
          ))}
          <div style={{ flex: 1, marginLeft: 12, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--ink)" }}>Update from Jodhpur:</strong> Anika & Ravi's Heritage Folio is in the bindery this week — your linen has arrived from Pondicherry and Anuj has begun stitching the spine.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm">View full timeline</button>
          <button className="btn btn-ghost btn-sm">Download invoice</button>
          <button className="btn btn-ghost btn-sm">Contact support</button>
        </div>
      </div>

      {/* Past orders */}
      {[
        { id: "SAF-2025-02831", date: "12 Nov 2025", items: "1 book · The Souvenir Album", total: "$419", status: "Delivered" },
        { id: "SAF-2025-01244", date: "3 May 2025", items: "2 books · Petite × 2", total: "$398", status: "Delivered" },
      ].map(o => (
        <div key={o.id} className="card" style={{ padding: 20, marginBottom: 12, display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 20, alignItems: "center" }}>
          <span className="tag" style={{ background: "var(--bg-3)" }}>{o.status}</span>
          <div>
            <div style={{ fontSize: 14 }}>{o.id}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{o.items} · {o.date}</div>
          </div>
          <div style={{ fontSize: 14 }}>{o.total}</div>
          <button className="btn btn-ghost btn-sm">Reorder</button>
        </div>
      ))}
    </div>
  );
}

function AccountProjects({ navigate }) {
  const projects = [
    { name: "Anika & Ravi · Wedding 2025", book: "Heritage Folio · 60 pages", thumb: STOCK.weddingCouple, progress: "Complete · in cart", spreads: 30 },
    { name: "Rajasthan, October 2025", book: "Souvenir Album · 40 pages", thumb: STOCK.travelTaj, progress: "Complete · in cart", spreads: 20 },
    { name: "Aarav's first year", book: "Petite · 24 pages", thumb: STOCK.family, progress: "Awaiting photos", spreads: 12 },
    { name: "Mum & Dad's 50th", book: "Signature · TBD", thumb: STOCK.weddingFlowers, progress: "Draft · 14% complete", spreads: 30 },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>Saved projects</h2>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("shop")}>+ New project</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {projects.map((p, i) => (
          <div key={i} className="card lift" style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate("studio")}>
            <div style={{ aspectRatio: "1" }}><SmartImage src={p.thumb} className="img-fill" /></div>
            <div style={{ padding: 18 }}>
              <h3 style={{ fontSize: 16, letterSpacing: "-0.01em", margin: "0 0 4px" }}>{p.name}</h3>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{p.book}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12 }}>{p.progress}</div>
              <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: p.progress.includes("Awaiting") ? "10%" : p.progress.includes("Draft") ? "14%" : "100%", background: "var(--accent)" }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountPlaceholder({ tab }) {
  const labels = { addresses: "Addresses", details: "Account details", rewards: "Rewards", wishlist: "Wishlist" };
  return (
    <div>
      <h2 style={{ fontSize: 28, letterSpacing: "-0.02em", marginBottom: 24 }}>{labels[tab]}</h2>
      <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
        Your {labels[tab].toLowerCase()} will appear here.
      </div>
    </div>
  );
}

Object.assign(window, { CartPage, CheckoutPage, ConfirmationPage, OrderStatusPage, AccountPage });


// ===== page-misc.jsx =====
// About, FAQ, Blog index, Article, Contact pages
function AboutPage({ navigate }) {
  return (
    <div className="about-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container-narrow">
          <span className="eyebrow">Our story</span>
          <h1 className="display" style={{ marginTop: 16, marginBottom: 32, fontSize: "clamp(56px, 7vw, 110px)" }}>
            A workshop<br/>between two<br/><em className="serif-italic">cities.</em>
          </h1>
          <p className="lede" style={{ fontSize: 22, marginBottom: 40, maxWidth: 720 }}>
            Safarnama means "travelogue" — the keepsake account of a journey. We started in 2019 with one binder in Jodhpur, six photo books, and a small office in Sydney. Today we are eleven people across two cities, hand-binding heirloom albums for ten thousand families.
          </p>
        </div>

        <div className="container" style={{ marginTop: 60 }}>
          <div style={{ aspectRatio: "16/9", borderRadius: "var(--r-xl)", overflow: "hidden", marginBottom: 80 }}>
            <SmartImage src={STOCK.craftBindery} alt="bindery" className="img-fill" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginBottom: 100 }}>
            <div>
              <span className="eyebrow">The why</span>
              <h2 className="headline" style={{ marginTop: 12, marginBottom: 24, fontSize: "clamp(32px, 4vw, 48px)" }}>Photographs deserve to be held.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink-3)", marginBottom: 16 }}>
                There are forty thousand photographs on the average Australian's phone. None of them will outlive us. The cloud will go dark, the formats will change, the accounts will lapse — and the moments will go with them.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink-3)" }}>
                A book made by hand, on archival paper, with thread and glue and care, is the oldest reliable technology we have for keeping a memory. It will outlive its phone. It will outlive its servers. It might outlive its makers.
              </p>
            </div>
            <div>
              <span className="eyebrow">The how</span>
              <h2 className="headline" style={{ marginTop: 12, marginBottom: 24, fontSize: "clamp(32px, 4vw, 48px)" }}>Six binders, three generations.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink-3)", marginBottom: 16 }}>
                Our bindery in Jodhpur is run by the Soni family — third-generation binders who learned the craft from their grandfather Ramesh, who learned it from his uncle, who bound ledgers for the maharaja's court.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink-3)" }}>
                We did not invent any of this. We only insist on it: hand-folded signatures, French-frame stitching, cold-pressed boards, archival paper. The slow way. The right way.
              </p>
            </div>
          </div>

          {/* Numbers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginBottom: 100, padding: "40px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {[
              { n: "10,402", l: "Albums delivered" },
              { n: "11", l: "People in the team" },
              { n: "3", l: "Generations of binders" },
              { n: "100yr", l: "Archival paper warranty" },
            ].map((s, i) => (
              <div key={i} style={{ borderRight: i < 3 ? "1px solid var(--line)" : "none", padding: "0 32px", textAlign: "center" }}>
                <div style={{ fontSize: 48, letterSpacing: "-0.025em", lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginTop: 12 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Team */}
          <div style={{ marginBottom: 100 }}>
            <span className="eyebrow">The team</span>
            <h2 className="headline" style={{ marginTop: 12, marginBottom: 40, fontSize: "clamp(32px, 4vw, 48px)" }}>The people who make your books.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {[
                { name: "Anuj Soni", role: "Master binder, Jodhpur", img: STOCK.craft },
                { name: "Reena Mehra", role: "Co-founder, Sydney", img: STOCK.weddingHands },
                { name: "Pradeep Soni", role: "Cover finisher, Jodhpur", img: STOCK.craftBindery },
                { name: "Lucy Tran", role: "Studio designer, Sydney", img: STOCK.weddingFlowers },
              ].map(p => (
                <div key={p.name}>
                  <div style={{ aspectRatio: "3/4", borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: 12 }}>
                    <SmartImage src={p.img} className="img-fill" />
                  </div>
                  <div style={{ fontSize: 16, letterSpacing: "-0.01em" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{p.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: "var(--bg-2)", borderRadius: "var(--r-xl)", padding: 60, textAlign: "center" }}>
            <h2 className="headline" style={{ marginBottom: 20, fontSize: "clamp(32px, 4vw, 48px)" }}>Make something with us.</h2>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("shop")}>Browse the collection</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ FAQ ============
function FaqPage() {
  const [active, setActive] = useState("orders");
  const sections = {
    orders: {
      label: "Orders & shipping",
      items: [
        { q: "How long does it take?", a: "Production is 4–6 weeks for standard orders. Express is 3–4 weeks (+$45). Rush is 14 days (+$120). Plus 2–7 days transit depending on delivery method." },
        { q: "Where do you ship?", a: "Across Australia (free over $400 AUD), New Zealand ($35), and internationally to most countries ($65–$120). Customs duties for international orders are the recipient's responsibility." },
        { q: "Can I track my order?", a: "Yes. From the moment your order is reviewed in Sydney through binding in Jodhpur and final dispatch — you'll see every milestone in your account, with email + SMS updates at each stage." },
        { q: "Can I change or cancel my order?", a: "Up to 24 hours after the Sydney review email, yes. After production begins in Jodhpur, the book is committed — but we'll always do our best." },
      ],
    },
    studio: {
      label: "Design Studio",
      items: [
        { q: "Do I need design experience?", a: "No. Our Studio includes 40+ pre-made spread layouts that auto-fill your photos. You can refine each page, or leave it as-is." },
        { q: "What photo formats do you accept?", a: "JPG, PNG, TIFF and HEIC. Minimum 300 DPI, ideally 3000px on the longest edge for full-bleed pages." },
        { q: "Can I save and come back later?", a: "Yes — every change autosaves. Your projects live in your account for as long as you want them there." },
        { q: "Can someone design it for me?", a: "Yes. Add 'Designed by Safarnama' at checkout (free with every order). We'll build a draft from your uploaded photos within 5 days, then iterate with you over email." },
      ],
    },
    materials: {
      label: "Books & materials",
      items: [
        { q: "Will the photos last?", a: "Our paper is cotton-rag, archival-grade, acid-free, and rated for 100+ years of colour stability. Kept indoors away from direct sun, it will outlive most of us." },
        { q: "Are the leather covers ethical?", a: "Yes. Our leather is full-grain, vegetable-tanned, sourced from a single tannery in Kanpur. Vegan-leather alternatives are also available." },
        { q: "What's the difference between Petite, Signature and Heritage?", a: "Petite is small format, simpler binding, 20–40 pages. Signature is the standard hand-bound book, 30–80 pages. Heritage is our flagship — full hand-stitching, slipcase, premium materials, 40–100 pages." },
      ],
    },
    returns: {
      label: "Returns & guarantee",
      items: [
        { q: "Can I return my book?", a: "Because every book is bespoke, made-to-order, we don't accept returns for change of mind. We do guarantee the binding for life — if it ever loosens, we'll repair it free of charge." },
        { q: "What if there's a printing error?", a: "Tell us within 14 days of delivery and we'll reprint at no cost. We hand-review every spread in Sydney before production, so this is rare — but it does happen." },
        { q: "Lifetime binding repair?", a: "Yes. If the binding ever loosens, the spine cracks, or a signature comes loose — send it back and we'll repair it. Forever. We just ask you to cover one-way shipping." },
      ],
    },
  };

  return (
    <div className="faq-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container-narrow">
          <span className="eyebrow">Help · FAQs</span>
          <h1 className="display" style={{ marginTop: 16, marginBottom: 24, fontSize: "clamp(48px, 6vw, 88px)" }}>
            Questions, <em className="serif-italic">answered.</em>
          </h1>
          <p className="lede" style={{ marginBottom: 60 }}>
            If you can't find what you're looking for, write to us at <a style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>hello@safarnama.com.au</a> — we reply within a day.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 60 }}>
            <aside style={{ position: "sticky", top: 120, alignSelf: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {Object.entries(sections).map(([id, s]) => (
                  <button key={id} onClick={() => setActive(id)} style={{ padding: "10px 14px", textAlign: "left", borderRadius: "var(--r-sm)", background: active === id ? "var(--bg-2)" : "transparent", color: active === id ? "var(--ink)" : "var(--ink-3)", fontSize: 14 }}>{s.label}</button>
                ))}
              </div>
            </aside>
            <div>
              <h2 style={{ fontSize: 32, letterSpacing: "-0.02em", marginBottom: 24 }}>{sections[active].label}</h2>
              <div>
                {sections[active].items.map((item, i) => (
                  <Accordion key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ BLOG INDEX ============
function BlogPage({ navigate }) {
  const featured = { title: "A short history of the Indian photo album", excerpt: "From hand-painted miniatures in the Mughal courts to the leather-bound family books of the 20th century — the keepsake has always belonged to us.", image: STOCK.travelTaj, category: "Heritage", date: "April 2026", read: "12 min read" };

  const posts = [
    { title: "How to choose your photographs", excerpt: "A guide to editing a wedding archive of 4,000 photos down to a 60-page album.", image: STOCK.weddingFlowers, category: "Guides", date: "March 2026", read: "8 min" },
    { title: "Inside our Jodhpur bindery", excerpt: "A morning with the team who hand-stitch every book.", image: STOCK.craft, category: "Studio", date: "February 2026", read: "6 min" },
    { title: "Why archival paper matters", excerpt: "The difference between a book that lasts 10 years and one that lasts 100.", image: STOCK.bookOpen, category: "Craft", date: "February 2026", read: "5 min" },
    { title: "Block-printing in Bagru", excerpt: "We commissioned a small village to print our silk covers. Here's how it went.", image: STOCK.weddingHenna, category: "Craft", date: "January 2026", read: "10 min" },
    { title: "On giving photographs as gifts", excerpt: "A short letter on the kind of present that's still being unwrapped, twenty years on.", image: STOCK.family, category: "Letters", date: "December 2025", read: "4 min" },
    { title: "The maths of a wedding album", excerpt: "How many photos, how many pages, how many spreads — a designer's rule of thumb.", image: STOCK.weddingMandap, category: "Guides", date: "November 2025", read: "7 min" },
  ];

  return (
    <div className="blog-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div style={{ marginBottom: 60 }}>
            <span className="eyebrow">The Journal</span>
            <h1 className="display" style={{ marginTop: 16, fontSize: "clamp(56px, 7vw, 110px)" }}>
              Notes &<br/><em className="serif-italic">essays.</em>
            </h1>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid var(--line)", marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "Heritage", "Guides", "Studio", "Craft", "Letters"].map((c, i) => (
                <button key={c} className={`tag ${i === 0 ? "dark" : ""}`} style={{ cursor: "pointer", padding: "8px 14px" }}>{c}</button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{posts.length + 1} entries</span>
          </div>

          {/* Featured */}
          <article className="lift" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 60, marginBottom: 80, cursor: "pointer" }} onClick={() => navigate("article")}>
            <div style={{ aspectRatio: "5/3", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
              <SmartImage src={featured.image} className="img-fill" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <span className="tag accent">Featured · {featured.category}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{featured.date} · {featured.read}</span>
              </div>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-0.025em", lineHeight: 1.05, fontWeight: 400, marginBottom: 20 }}>{featured.title}</h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-3)", marginBottom: 24 }}>{featured.excerpt}</p>
              <span style={{ fontSize: 14, color: "var(--accent-deep)" }}>Read essay →</span>
            </div>
          </article>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {posts.map((p, i) => (
              <ArticleCard key={i} {...p} navigate={navigate} />
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ marginTop: 100, padding: "60px", background: "var(--bg-2)", borderRadius: "var(--r-xl)", textAlign: "center" }}>
            <span className="eyebrow">Letters</span>
            <h2 className="headline" style={{ marginTop: 12, marginBottom: 16 }}>A monthly note from the studio.</h2>
            <p className="lede" style={{ marginBottom: 28, maxWidth: 540, margin: "0 auto 28px" }}>
              One essay, one book, one photograph. Once a month. No promotions, no nonsense.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", maxWidth: 460, margin: "0 auto" }}>
              <input className="input" placeholder="your@email.com" style={{ flex: 1 }} />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ ARTICLE ============
function ArticlePage({ navigate }) {
  return (
    <div className="article-page">
      <article style={{ padding: "60px 0 100px" }}>
        <div className="container-narrow" style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: 32 }}>
            <a className="btn btn-ghost btn-sm" onClick={() => navigate("blog")}>← All entries</a>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
            <span className="tag accent">Heritage</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>April 2026 · 12 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 5vw, 72px)", letterSpacing: "-0.03em", lineHeight: 1.05, fontWeight: 400, marginBottom: 24 }}>
            A short history of the <em className="serif-italic">Indian photo album.</em>
          </h1>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--line)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-3)", overflow: "hidden" }}>
              <SmartImage src={STOCK.weddingHands} className="img-fill" />
            </div>
            <div>
              <div style={{ fontSize: 14 }}>Reena Mehra</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Co-founder, Safarnama</div>
            </div>
          </div>
        </div>

        <div className="container">
          <div style={{ aspectRatio: "16/9", borderRadius: "var(--r-xl)", overflow: "hidden", marginBottom: 60 }}>
            <SmartImage src={STOCK.travelTaj} className="img-fill" />
          </div>
        </div>

        <div className="container-narrow" style={{ maxWidth: 720 }}>
          <p style={{ fontSize: 22, lineHeight: 1.55, letterSpacing: "-0.01em", color: "var(--ink-2)", marginBottom: 32, fontFamily: "var(--font-serif)" }}>
            Long before the Polaroid, before the Kodak Brownie, before photography itself, India had keepsake books — folios of hand-painted miniatures, bound in silk and leather, that documented a family, a marriage, a journey, a court.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24 }}>
            The Mughal courts, in the sixteenth and seventeenth centuries, kept extraordinary albums. The <em>muraqqa</em>, as it was called, was a folio of paintings, calligraphies and pressed flowers, gathered into a single bound book and added to over a lifetime. Emperor Jahangir's <em>muraqqa</em> contained over a hundred miniatures and outlived him by four hundred years.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24 }}>
            When photography arrived in Bombay in 1840 — only a year after Daguerre announced his process in Paris — the technology slotted into an existing tradition. Indian families, who had always kept books of memories, simply began pasting albumen prints into them.
          </p>
          <h2 style={{ fontSize: 32, letterSpacing: "-0.02em", margin: "48px 0 20px" }}>The studio era</h2>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24 }}>
            Between 1860 and 1947, Indian wedding photography was studio photography. A bride and groom would sit, motionless, for thirty to ninety seconds. The single photograph would be hand-tinted, mounted on board, and bound — usually in red leather with gilt edges — into the family's <em>shaadi-ki-album</em>.
          </p>
          <blockquote style={{ borderLeft: "2px solid var(--accent)", padding: "8px 0 8px 32px", margin: "40px 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 24, lineHeight: 1.5, color: "var(--ink-2)" }}>
            "The album was not a record. It was a kind of altar — kept on a shelf, opened on anniversaries, carried by the family from Lahore to Delhi at Partition."
          </blockquote>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24 }}>
            The thirty seconds it took to make those exposures shows in the photographs themselves. The faces are still. Composed. Knowing. They were taking part in an act of preservation, and they knew it.
          </p>

          {/* Newsletter inline */}
          <div style={{ background: "var(--bg-2)", borderRadius: "var(--r-md)", padding: 32, margin: "60px 0" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 8 }}>Subscribe</div>
            <div style={{ fontSize: 18, marginBottom: 16 }}>Read the rest of our journal — sent monthly, never more.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="your@email.com" style={{ flex: 1 }} />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>

          <h2 style={{ fontSize: 32, letterSpacing: "-0.02em", margin: "48px 0 20px" }}>What we can learn</h2>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24 }}>
            We take ten thousand photographs a year on our phones. We will print perhaps eleven of them. The rest will live, briefly, on someone's storage account, until the account lapses and the moments go with it.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-2)" }}>
            The point of an album is not to hold all your photographs. It is to choose. To say: <em>these</em> ones, these are what we want to keep. These are the ones we want our grandchildren to find. The Mughal emperors knew it. So did the studio photographers of Lahore. So might we.
          </p>

          <hr className="hr" style={{ margin: "60px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase" }}>Tagged</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <span className="tag">heritage</span>
                <span className="tag">history</span>
                <span className="tag">photography</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="icon-btn" style={{ background: "var(--bg-2)" }}>♡</button>
              <button className="btn btn-ghost btn-sm">Share</button>
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="container" style={{ marginTop: 100 }}>
          <h2 className="headline" style={{ fontSize: "clamp(28px, 3vw, 40px)", marginBottom: 32 }}>Continue reading.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            <ArticleCard title="How to choose your photographs" excerpt="Editing a wedding archive of 4,000 photos." image={STOCK.weddingFlowers} category="Guides" date="Mar 2026" navigate={navigate} />
            <ArticleCard title="Inside our Jodhpur bindery" excerpt="A morning with our binders." image={STOCK.craft} category="Studio" date="Feb 2026" navigate={navigate} />
            <ArticleCard title="Block-printing in Bagru" excerpt="The village that prints our silk." image={STOCK.weddingHenna} category="Craft" date="Jan 2026" navigate={navigate} />
          </div>
        </div>
      </article>
    </div>
  );
}

// ============ CONTACT ============
function ContactPage() {
  return (
    <div className="contact-page">
      <section style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
            <div>
              <span className="eyebrow">Get in touch</span>
              <h1 className="display" style={{ marginTop: 16, marginBottom: 28, fontSize: "clamp(48px, 6vw, 88px)" }}>
                Write to <em className="serif-italic">us.</em>
              </h1>
              <p className="lede" style={{ marginBottom: 48 }}>
                Ordering questions, design requests, an essay you'd like us to publish — we read everything that lands in our inbox, usually within the day.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {[
                  { l: "General enquiries", v: "hello@safarnama.com.au", note: "We reply within 24 hours" },
                  { l: "Studio support", v: "studio@safarnama.com.au", note: "For help with the Studio editor" },
                  { l: "Wholesale & gifting", v: "trade@safarnama.com.au", note: "10+ books, corporate gifts" },
                  { l: "Sydney showroom", v: "By appointment, Tues–Sat", note: "Suite 4, 217 King Street, Newtown NSW" },
                ].map(c => (
                  <div key={c.l} style={{ paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 8 }}>{c.l}</div>
                    <div style={{ fontSize: 18, letterSpacing: "-0.01em", marginBottom: 4 }}>{c.v}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 22, letterSpacing: "-0.015em", marginBottom: 24 }}>Send us a note.</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Name"><input className="input" placeholder="Your name" /></Field>
                <Field label="Email"><input className="input" placeholder="your@email.com" /></Field>
                <Field label="Subject" full>
                  <select className="select"><option>General question</option><option>Studio support</option><option>Order issue</option><option>Wholesale</option><option>Press</option></select>
                </Field>
                <Field label="Order number (optional)" full><input className="input" placeholder="SAF-2025-..." /></Field>
                <Field label="Message" full>
                  <textarea className="input" rows="6" placeholder="Tell us what you're thinking..." style={{ resize: "vertical" }}></textarea>
                </Field>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 24, width: "100%" }}>Send message</button>
              <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
                We'll only use your details to reply. No newsletter, no marketing — promise.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { AboutPage, FaqPage, BlogPage, ArticlePage, ContactPage });


// ===== App entry from Safarnama.html =====
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": [
    "#F4EFE6",
    "#1C1A17",
    "#9A6B3F"
  ],
  "fontFamily": "Inter Tight",
  "heroVariant": "image",
  "cardStyle": "wide",
  "studioCanvasTone": "ivory",
  "radius": "soft"
}/*EDITMODE-END*/;

const PALETTES = [
  ["#F4EFE6","#1C1A17","#9A6B3F"], // warm ivory + ink + terracotta
  ["#F2EBDF","#2A2A2E","#7A2A2A"], // ivory + slate + crimson
  ["#EFE9DD","#1F2A23","#5A6E4A"], // sage + olive
  ["#1C1A17","#F4EFE6","#C9A36E"], // dark mode w/ gold
  ["#FAF6EE","#1A1A1A","#3D5A8A"], // crisp + indigo
];

const FONT_OPTIONS = ["Inter Tight","Söhne","DM Sans","IBM Plex Sans","Manrope"];

function App() {
  const [page, setPage] = React.useState("home");
  const [params, setParams] = React.useState({});
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const productData = useShopifyProducts();
  const [cartItems, setCartItems] = React.useState([]);
  const [pendingUploadPhotosBySlug, setPendingUploadPhotosBySlug] = React.useState({});

  const addToCart = React.useCallback((item) => {
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) => (
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + item.qty } : cartItem
        ));
      }
      return [...current, item];
    });
  }, []);

  const saveAlbumDesignToCart = React.useCallback((albumDesign, product) => {
    if (!product || !albumDesign) return;
    setCartItems((current) => {
      const existingByRoute = albumDesign.cartItemId ? current.find((item) => item.id === albumDesign.cartItemId) : null;
      const size = existingByRoute?.details?.size || albumDesign.details?.size || product.sizes?.[0] || "";
      const pages = Number(existingByRoute?.details?.pages || albumDesign.details?.pages || product.pages?.[1] || product.pages?.[0] || albumDesign.pageCount || 0);
      const cover = existingByRoute?.details?.cover || albumDesign.details?.cover || product.cover?.[0] || "";
      const paper = existingByRoute?.details?.paper || albumDesign.details?.paper || product.paper?.[0] || "";
      const qty = Number(existingByRoute?.qty || albumDesign.qty || 1);
      const draftItem = buildCartItem({
        product,
        size,
        pages,
        cover,
        paper,
        qty,
        albumDesign,
        project: albumDesign.projectName,
        status: "Designed",
      });
      const existing = existingByRoute || current.find((item) => item.id === draftItem.id);
      const savedDesign = { ...albumDesign, cartItemId: existing?.id || draftItem.id };
      const savedItem = {
        ...(existing || draftItem),
        ...draftItem,
        id: existing?.id || draftItem.id,
        qty: existing?.qty || draftItem.qty,
        status: "Designed",
        project: savedDesign.projectName,
        albumDesign: savedDesign,
      };

      if (existing) {
        return current.map((item) => item.id === existing.id ? savedItem : item);
      }
      return [...current, savedItem];
    });
    setPendingUploadPhotosBySlug((current) => {
      if (!current[product.slug]) return current;
      const next = { ...current };
      delete next[product.slug];
      return next;
    });
  }, []);

  const saveProfessionalDesignToCart = React.useCallback((slug, request) => {
    const product = productData.products.find((item) => item.slug === slug) || productData.products[0];
    if (!product || !request) return;
    const size = request.details?.size || product.sizes?.[0] || "";
    const pages = Number(request.details?.pages || product.pages?.[1] || product.pages?.[0] || 0);
    const cover = request.details?.cover || product.cover?.[0] || "";
    const paper = request.details?.paper || product.paper?.[0] || "";
    const qty = Number(request.qty || 1);
    const professionalDesignRequest = {
      requested: true,
      projectName: request.projectName || `${product.name} professional design`,
      albumFolder: request.albumFolder || "",
      assets: request.assets || [],
      requestedAt: new Date().toISOString(),
    };

    addToCart(buildCartItem({
      product,
      size,
      pages,
      cover,
      paper,
      qty,
      professionalDesignRequest,
      project: professionalDesignRequest.projectName,
      status: "Team design requested",
    }));

    setPendingUploadPhotosBySlug((current) => {
      if (!current[slug]) return current;
      const next = { ...current };
      delete next[slug];
      return next;
    });
  }, [addToCart, productData.products]);

  const savePendingUploadPhotos = React.useCallback((slug, uploadDraft) => {
    if (!slug) return;
    setPendingUploadPhotosBySlug((current) => ({
      ...current,
      [slug]: uploadDraft,
    }));
  }, []);

  React.useEffect(() => {
    // hash router
    const onHash = () => {
      const h = window.location.hash.slice(1) || "home";
      const [name, qs] = h.split("?");
      const p = {};
      if (qs) qs.split("&").forEach(kv => { const [k,v] = kv.split("="); p[k] = decodeURIComponent(v||""); });
      setPage(name);
      setParams(p);
      window.scrollTo(0, 0);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (name, p = {}) => {
    const qs = Object.entries(p).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    window.location.hash = qs ? `${name}?${qs}` : name;
  };

  // Apply tweaks to CSS
  React.useEffect(() => {
    const root = document.documentElement;
    const [bg, ink, accent] = tweaks.palette || PALETTES[0];
    root.style.setProperty("--bg", bg);
    root.style.setProperty("--ink", ink);
    root.style.setProperty("--accent", accent);
    // derived
    const isDark = ink === "#F4EFE6" || bg === "#1C1A17";
    root.style.setProperty("--paper", isDark ? "#262420" : "#FBF8F2");
    root.style.setProperty("--bg-2", isDark ? "#272421" : adjust(bg, -6));
    root.style.setProperty("--bg-3", isDark ? "#332F2A" : adjust(bg, -12));
    root.style.setProperty("--ink-2", isDark ? "#E8E1D2" : adjust(ink, 18));
    root.style.setProperty("--ink-3", isDark ? "#B5ACA0" : adjust(ink, 45));
    root.style.setProperty("--muted", isDark ? "#9C9388" : "#6B6259");
    root.style.setProperty("--line", isDark ? "#3A352F" : adjust(bg, -16));
    root.style.setProperty("--line-2", isDark ? "#4A443D" : adjust(bg, -22));
    root.style.setProperty("--accent-2", lighten(accent, 12));
    root.style.setProperty("--accent-deep", darken(accent, 18));

    root.style.setProperty("--font", `"${tweaks.fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif`);

    // radius scale
    const r = tweaks.radius;
    root.style.setProperty("--r-sm", r === "sharp" ? "2px" : r === "round" ? "12px" : "8px");
    root.style.setProperty("--r-md", r === "sharp" ? "4px" : r === "round" ? "20px" : "14px");
    root.style.setProperty("--r-lg", r === "sharp" ? "6px" : r === "round" ? "32px" : "22px");
    root.style.setProperty("--r-xl", r === "sharp" ? "8px" : r === "round" ? "44px" : "32px");

    // load font
    const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(tweaks.fontFamily)}:wght@300;400;500;600;700&display=swap`;
    let link = document.getElementById("dynamic-font");
    if (!link) { link = document.createElement("link"); link.id = "dynamic-font"; link.rel = "stylesheet"; document.head.appendChild(link); }
    link.href = fontHref;
  }, [tweaks]);

  const showShell = page !== "studio" && page !== "checkout";
  const activeStudioCartItem = params?.cartItemId ? cartItems.find((item) => item.id === params.cartItemId) : null;
  const pendingUploadDraft = pendingUploadPhotosBySlug[params?.slug] || {};
  const pendingUploadPhotos = Array.isArray(pendingUploadDraft) ? pendingUploadDraft : pendingUploadDraft.photos || [];
  const pendingUploadAlbumFolder = Array.isArray(pendingUploadDraft) ? "" : pendingUploadDraft.albumFolder || "";

  let content;
  if (page === "home") content = <HomePage navigate={navigate} tweaks={tweaks} />;
  else if (page === "shop") content = <ShopPage navigate={navigate} tweaks={tweaks} />;
  else if (page === "product") content = <ProductPage navigate={navigate} params={params} onAddToCart={addToCart} />;
  else if (page === "upload") content = <UploadPage navigate={navigate} params={params} products={productData.products} SmartImage={SmartImage} initialPhotos={pendingUploadPhotos} initialAlbumFolder={pendingUploadAlbumFolder} onContinueWithPhotos={savePendingUploadPhotos} onProfessionalDesign={saveProfessionalDesignToCart} />;
  else if (page === "studio") content = <StudioPage navigate={navigate} params={params} products={productData.products} SmartImage={SmartImage} Logo={Logo} initialAlbumDesign={activeStudioCartItem?.albumDesign || null} initialPhotoLibrary={pendingUploadPhotos} initialAlbumFolder={pendingUploadAlbumFolder} onSaveAlbumDesign={saveAlbumDesignToCart} />;
  else if (page === "cart") content = <CartPage navigate={navigate} items={cartItems} setItems={setCartItems} />;
  else if (page === "checkout") content = <CheckoutPage navigate={navigate} items={cartItems} />;
  else if (page === "confirmation") content = <ConfirmationPage navigate={navigate} />;
  else if (page === "status") content = <OrderStatusPage navigate={navigate} />;
  else if (page === "account") content = <AccountPage navigate={navigate} />;
  else if (page === "about") content = <AboutPage navigate={navigate} />;
  else if (page === "faq") content = <FaqPage />;
  else if (page === "blog") content = <BlogPage navigate={navigate} />;
  else if (page === "article") content = <ArticlePage navigate={navigate} />;
  else if (page === "contact") content = <ContactPage />;
  else if (page === "admin") content = <AdminPage />;
  else content = <HomePage navigate={navigate} tweaks={tweaks} />;

  return (
    <ProductDataContext.Provider value={productData}>
      <div data-screen-label={pageLabel(page)} data-page={page}>
        {showShell && <TopNav active={page} navigate={navigate} cartCount={cartItemCount(cartItems)} />}
        {content}
        {showShell && <Footer navigate={navigate} />}

        <TweaksPanel title="Tweaks">
            <TweakSection title="Palette">
              <TweakColor label="Color palette" value={tweaks.palette} options={PALETTES} onChange={(v) => setTweak("palette", v)} />
            </TweakSection>
            <TweakSection title="Typography">
              <TweakSelect label="Font family" value={tweaks.fontFamily} options={FONT_OPTIONS} onChange={(v) => setTweak("fontFamily", v)} />
            </TweakSection>
            <TweakSection title="Layout">
              <TweakRadio label="Hero variant" value={tweaks.heroVariant} options={[{value:"image",label:"Image-led"},{value:"type",label:"Type-led"}]} onChange={(v) => setTweak("heroVariant", v)} />
              <TweakRadio label="Product cards" value={tweaks.cardStyle} options={[{value:"tall",label:"Tall"},{value:"wide",label:"Wide"}]} onChange={(v) => setTweak("cardStyle", v)} />
              <TweakSelect label="Radius scale" value={tweaks.radius} options={["sharp","soft","round"]} onChange={(v) => setTweak("radius", v)} />
            </TweakSection>
            <TweakSection title="Studio">
              <TweakRadio label="Canvas tone" value={tweaks.studioCanvasTone} options={[{value:"ivory",label:"Ivory"},{value:"charcoal",label:"Charcoal"}]} onChange={(v) => setTweak("studioCanvasTone", v)} />
            </TweakSection>
            <TweakSection title="Quick links">
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
                {[["Home","home"],["Shop","shop"],["Product","product"],["Upload","upload"],["Studio","studio"],["Cart","cart"],["Checkout","checkout"],["Confirmation","confirmation"],["Status","status"],["Admin","admin"],["Account","account"],["About","about"],["FAQ","faq"],["Blog","blog"],["Article","article"],["Contact","contact"]].map(([l,p]) => (
                  <button key={p} onClick={() => navigate(p)} style={{padding:"7px 10px", fontSize:11, border:"1px solid var(--line-2)", borderRadius:6, background:page===p?"var(--ink)":"var(--paper)", color:page===p?"var(--paper)":"var(--ink)"}}>{l}</button>
                ))}
              </div>
            </TweakSection>
          </TweaksPanel>
      </div>
    </ProductDataContext.Provider>
  );
}

function pageLabel(p) {
  return ({home:"Home",shop:"Shop",product:"Product",upload:"Upload",studio:"Studio",cart:"Cart",checkout:"Checkout",confirmation:"Confirmation",status:"Order Status",admin:"Admin",account:"Account",about:"About",faq:"FAQ",blog:"Blog",article:"Article",contact:"Contact"})[p] || p;
}

// Color helpers
function adjust(hex, percent) {
  const num = parseInt(hex.slice(1),16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0xff) + percent;
  let b = (num & 0xff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}
function lighten(h, p) { return adjust(h, p); }
function darken(h, p) { return adjust(h, -p); }

export default App;
