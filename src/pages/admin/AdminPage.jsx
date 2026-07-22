import React from "react";
import { downloadStudioPdf } from "../studio/StudioPage.jsx";

const { useEffect, useMemo, useState } = React;

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

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function cleanFileName(value, fallback = "download") {
  return String(value || fallback)
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || fallback;
}

function collectDesignAssets(design) {
  const assets = new Map();
  const add = (photo = {}) => {
    const storagePath = photo.storagePath || photo.path;
    if (!storagePath || assets.has(storagePath)) return;
    assets.set(storagePath, {
      storagePath,
      storageBucket: photo.storageBucket || photo.bucket || "album-photos",
      fileName: photo.fileName || photo.name || storagePath.split("/").pop(),
      contentType: photo.contentType || photo.mimeType || "",
      size: photo.size || photo.sizeBytes || null,
      src: photo.src || "",
    });
  };

  (design?.photoLibrary || []).forEach(add);
  (design?.spreads || []).forEach((spread) => {
    (spread.items || []).forEach(add);
  });

  return [...assets.values()];
}

async function getSignedAssetUrl(asset) {
  if (!asset.storagePath) return asset.src;
  const params = new URLSearchParams({
    bucket: asset.storageBucket || "album-photos",
    path: asset.storagePath,
  });
  const response = await fetch(apiUrl(`/api/photo-url?${params.toString()}`));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Could not create asset URL (${response.status})`);
  }
  return data.signedUrl || asset.src;
}

async function refreshDesignImageUrls(design) {
  const assets = collectDesignAssets(design);
  const urlByPath = new Map();
  await Promise.all(assets.map(async (asset) => {
    const signedUrl = await getSignedAssetUrl(asset);
    urlByPath.set(asset.storagePath, signedUrl);
  }));

  const refreshPhoto = (photo) => {
    const path = photo.storagePath || photo.path;
    return path && urlByPath.has(path) ? { ...photo, src: urlByPath.get(path) } : photo;
  };

  return {
    ...design,
    photoLibrary: (design.photoLibrary || []).map(refreshPhoto),
    spreads: (design.spreads || []).map((spread) => ({
      ...spread,
      items: (spread.items || []).map(refreshPhoto),
    })),
  };
}

function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadAsset(asset) {
  const signedUrl = await getSignedAssetUrl(asset);
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error(`Could not download ${asset.fileName || asset.storagePath}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanFileName(asset.fileName || asset.storagePath.split("/").pop(), "album-photo");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getCheckoutDesigns(checkout) {
  return (checkout.items || [])
    .filter((item) => item.albumDesign)
    .map((item) => ({
      item,
      design: item.albumDesign,
      assets: collectDesignAssets(item.albumDesign),
    }));
}

export function AdminPage() {
  const [checkouts, setCheckouts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const stats = useMemo(() => {
    const designs = checkouts.flatMap(getCheckoutDesigns);
    return {
      checkouts: checkouts.length,
      designs: designs.length,
      assets: assets.length,
      paid: checkouts.filter((checkout) => checkout.status === "paid").length,
    };
  }, [assets.length, checkouts]);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [checkoutsResponse, assetsResponse] = await Promise.all([
        fetch(apiUrl("/api/checkouts")),
        fetch(apiUrl("/api/assets")),
      ]);
      const [checkoutsData, assetsData] = await Promise.all([
        checkoutsResponse.json().catch(() => ({})),
        assetsResponse.json().catch(() => ({})),
      ]);
      if (!checkoutsResponse.ok) throw new Error(checkoutsData.error || "Could not load checkouts.");
      if (!assetsResponse.ok) throw new Error(assetsData.error || "Could not load assets.");
      setCheckouts(checkoutsData.checkouts || []);
      setAssets(assetsData.assets || []);
    } catch (err) {
      setError(err.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDownloadPdf = async (checkout, design) => {
    const actionId = `pdf-${checkout.appCartId}-${design.cartItemId || design.projectName}`;
    setBusyAction(actionId);
    setError("");
    try {
      const refreshed = await refreshDesignImageUrls(design);
      await downloadStudioPdf(refreshed.spreads || [], refreshed.projectName || checkout.appOrderId || "safarnama-album");
    } catch (err) {
      setError(err.message || "Could not create album PDF.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDownloadAllAssets = async (checkout, design) => {
    const designAssets = collectDesignAssets(design);
    const actionId = `assets-${checkout.appCartId}-${design.cartItemId || design.projectName}`;
    setBusyAction(actionId);
    setError("");
    try {
      for (const asset of designAssets) {
        await downloadAsset(asset);
      }
    } catch (err) {
      setError(err.message || "Could not download album assets.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDownloadAsset = async (asset) => {
    setBusyAction(`asset-${asset.storagePath}`);
    setError("");
    try {
      await downloadAsset(asset);
    } catch (err) {
      setError(err.message || "Could not download asset.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="admin-page">
      <section style={{ padding: "56px 0 100px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end", marginBottom: 34 }}>
            <div>
              <span className="eyebrow">Admin</span>
              <h1 className="headline" style={{ margin: "12px 0 10px", fontSize: "clamp(34px, 4vw, 56px)" }}>Orders and album files.</h1>
              <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 15, lineHeight: 1.6, maxWidth: 680 }}>
                Review checked-out carts, download production PDFs, and retrieve uploaded image assets from Supabase Storage.
              </p>
            </div>
            <button className="btn btn-ghost" onClick={loadAdminData} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <AdminStat label="Checkouts" value={stats.checkouts} />
            <AdminStat label="Paid" value={stats.paid} />
            <AdminStat label="Album designs" value={stats.designs} />
            <AdminStat label="Assets tracked" value={stats.assets} />
          </div>

          {error && (
            <div className="fade-in" style={{ marginBottom: 18, padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid rgba(168,87,48,0.25)", background: "rgba(168,87,48,0.08)", color: "var(--rust)", fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="card" style={{ padding: 36, color: "var(--ink-3)" }}>Loading checked-out orders...</div>
          ) : checkouts.length === 0 ? (
            <div className="card" style={{ padding: 44, textAlign: "center" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>No checkouts yet.</h2>
              <p style={{ color: "var(--ink-3)", margin: 0 }}>Checked-out album projects will appear here after Shopify checkout is created.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {checkouts.map((checkout) => (
                <AdminCheckoutCard
                  key={checkout.appCartId}
                  checkout={checkout}
                  busyAction={busyAction}
                  onDownloadPdf={handleDownloadPdf}
                  onDownloadAssets={handleDownloadAllAssets}
                  onDownloadAsset={handleDownloadAsset}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminStat({ label, value }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-0.025em" }}>{value}</div>
    </div>
  );
}

function AdminCheckoutCard({ checkout, busyAction, onDownloadPdf, onDownloadAssets, onDownloadAsset }) {
  const designs = getCheckoutDesigns(checkout);
  const itemCount = (checkout.items || []).reduce((total, item) => total + Number(item.quantity || item.qty || 1), 0);

  return (
    <article className="card" style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            <span className="tag">{checkout.status || "checkout_created"}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{formatDate(checkout.createdAt)}</span>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, letterSpacing: "-0.015em" }}>{checkout.appOrderId || checkout.appCartId}</h2>
          <div style={{ color: "var(--ink-3)", fontSize: 13, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
            <span>{designs.length} album design{designs.length === 1 ? "" : "s"}</span>
            {checkout.shopifyCartId && <span>Shopify cart saved</span>}
          </div>
        </div>
        {checkout.checkoutUrl && (
          <a className="btn btn-ghost btn-sm" href={checkout.checkoutUrl} target="_blank" rel="noreferrer">Open Shopify checkout</a>
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {designs.length === 0 ? (
          <div style={{ padding: 16, background: "var(--bg-2)", borderRadius: "var(--r-sm)", color: "var(--ink-3)", fontSize: 13 }}>
            This checkout has no saved album design JSON.
          </div>
        ) : designs.map(({ item, design, assets: designAssets }) => {
          const actionKey = `${checkout.appCartId}-${design.cartItemId || design.projectName}`;
          return (
            <div key={item.id || design.cartItemId || design.projectName} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 5 }}>{item.tier || "Album"} · {item.variantTitle || "Selected variant"}</div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18, letterSpacing: "-0.01em" }}>{item.name || design.projectName || "Album design"}</h3>
                  <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                    {design.projectName || "Untitled project"} · {design.spreadCount || 0} spreads · {design.pageCount || 0} pages · {designAssets.length} assets
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => onDownloadPdf(checkout, design)} disabled={busyAction === `pdf-${actionKey}`}>
                    {busyAction === `pdf-${actionKey}` ? "Creating PDF..." : "Download PDF"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onDownloadAssets(checkout, design)} disabled={!designAssets.length || busyAction === `assets-${actionKey}`}>
                    {busyAction === `assets-${actionKey}` ? "Downloading..." : "Download assets"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadJson(design, `${cleanFileName(design.projectName || checkout.appOrderId, "album-design")}.json`)}>
                    Design JSON
                  </button>
                </div>
              </div>

              {designAssets.length > 0 && (
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {designAssets.slice(0, 8).map((asset) => (
                    <button key={asset.storagePath} onClick={() => onDownloadAsset(asset)} disabled={busyAction === `asset-${asset.storagePath}`} style={{ padding: "9px 10px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg-2)", color: "var(--ink)", fontSize: 12, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: busyAction === `asset-${asset.storagePath}` ? 0.55 : 1 }} title={asset.storagePath}>
                      {busyAction === `asset-${asset.storagePath}` ? "Downloading..." : (asset.fileName || asset.storagePath)}
                    </button>
                  ))}
                  {designAssets.length > 8 && (
                    <div style={{ padding: "9px 10px", color: "var(--muted)", fontSize: 12 }}>
                      +{designAssets.length - 8} more in bulk download
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default AdminPage;
