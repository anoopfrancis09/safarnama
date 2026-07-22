function envValue(...names) {
  for (const name of names) {
    const value = (process.env[name] || "").trim();
    if (!value || value.startsWith("your_")) continue;
    return value;
  }
  return "";
}

export const config = {
  corsOrigin: process.env.CORS_ORIGIN || "*",
  shopify: {
    storeDomain: envValue("SHOPIFY_STORE_DOMAIN", "VITE_SHOPIFY_STORE_DOMAIN"),
    storefrontToken: envValue("SHOPIFY_STOREFRONT_PUBLIC_TOKEN", "VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN"),
    apiVersion: envValue("SHOPIFY_API_VERSION", "VITE_SHOPIFY_API_VERSION") || "2026-04",
    webhookSecret: envValue("SHOPIFY_WEBHOOK_SECRET"),
  },
  supabase: {
    url: envValue("SUPABASE_URL"),
    serviceRoleKey: envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"),
  },
};

export function requireSupabaseConfig() {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error("Missing Supabase server credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.");
  }

  if (config.supabase.url.includes("your-project.supabase.co")) {
    throw new Error("SUPABASE_URL is still the placeholder value. Set it to your real Supabase project URL.");
  }

  if (!config.supabase.serviceRoleKey.startsWith("sb_secret_") && !config.supabase.serviceRoleKey.startsWith("eyJ")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be a server-only Supabase secret/service-role key, not a publishable or anon key.");
  }
}
