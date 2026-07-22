import { config } from "./config.js";

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Shopify-Hmac-Sha256, X-Shopify-Topic, X-Shopify-Webhook-Id");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export function sendJson(res, status, body) {
  setCors(res);
  res.status(status).json(body);
}

export function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  setCors(res);
  res.status(204).end();
  return true;
}

export function requireMethod(req, res, method) {
  if (req.method === method) return true;
  sendJson(res, 405, { error: `Method ${req.method} is not allowed.` });
  return false;
}

export function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const raw = await readRawBody(req);
  if (!raw.length) return {};
  return JSON.parse(raw.toString("utf8"));
}

export function getQueryParam(req, name) {
  if (req.query?.[name]) {
    const value = req.query[name];
    return Array.isArray(value) ? value[0] : value;
  }

  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "", `https://${host}`);
  return url.searchParams.get(name) || "";
}
