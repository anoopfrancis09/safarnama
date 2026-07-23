import React from "react";

const { useState, useEffect, useRef, createContext, useContext } = React;

function DefaultSmartImage({ src, alt, className, style }) {
  if (!src) {
    return (
      <div className={className} style={{ background: "linear-gradient(135deg, var(--bg-3) 0%, var(--bg-2) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "ui-monospace, monospace", fontSize: 11, ...style }}>
        {alt || "image"}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} />;
}

function DefaultLogo({ color = "currentColor" }) {
  return <span style={{ color, fontSize: 14, letterSpacing: 0.12, textTransform: "uppercase" }}>Safarnama</span>;
}

const StudioComponentContext = createContext({ SmartImage: DefaultSmartImage, Logo: DefaultLogo });

function useStudioComponents() {
  return useContext(StudioComponentContext);
}

// ===== page-studio.jsx =====
// Photo upload + Design Studio (deep editor)
function formatUploadFileSize(size = 0) {
  if (!size) return "0 KB";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function imageResolutionFromUrl(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || 0, height: image.naturalHeight || 0 });
    image.onerror = () => resolve({ width: 0, height: 0 });
    image.src = src;
  });
}

function isLowResolutionPhoto(width, height) {
  return Boolean(width && height && Math.max(width, height) < 3000);
}

function isUploadableImageFile(file) {
  return Boolean(file?.type?.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|tiff?)$/i.test(file?.name || ""));
}

function stripRuntimePhotoFields(photo) {
  const { file, localSrc, ...metadata } = photo || {};
  return metadata;
}

export function UploadPage({ navigate, params, products = [], SmartImage = DefaultSmartImage, initialPhotos = [], initialAlbumFolder = "", onContinueWithPhotos, onProfessionalDesign }) {
  const product = products.find(p => p.slug === params?.slug) || products[0];
  const selectedDetails = {
    size: params?.size || product.sizes?.[0] || "",
    pages: params?.pages || product.pages?.[1] || product.pages?.[0] || "",
    cover: params?.cover || product.cover?.[0] || "",
    paper: params?.paper || product.paper?.[0] || "",
  };
  const inputRef = useRef(null);
  const albumFolderRef = useRef(initialAlbumFolder || createAlbumStorageFolder(product?.name || product?.slug || "album-design"));
  const [files, setFiles] = useState(() => initialPhotos || []);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    albumFolderRef.current = initialAlbumFolder || createAlbumStorageFolder(product?.name || product?.slug || "album-design");
    setFiles(initialPhotos || []);
  }, [product.slug]);

  const addSelectedFiles = async (selectedFiles) => {
    const imageFiles = [...(selectedFiles || [])].filter(isUploadableImageFile);
    if (!imageFiles.length) return;

    const photos = imageFiles.map((file, index) => {
      const id = `upload-step-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
      return {
        id,
        name: file.name,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        sizeLabel: formatUploadFileSize(file.size),
        res: "Reading...",
        quality: "checking",
        src: URL.createObjectURL(file),
        file,
        uploading: true,
        uploaded: false,
      };
    });

    setFiles((current) => [...current, ...photos]);
    photos.forEach(async (photo) => {
      const { width, height } = await imageResolutionFromUrl(photo.src);
      setFiles((current) => current.map((item) => (
        item.id === photo.id
          ? {
              ...item,
              res: width && height ? `${width} × ${height}` : "Unknown resolution",
              quality: isLowResolutionPhoto(width, height) ? "low" : "high",
            }
          : item
      )));
    });

    const uploadedPhotos = await uploadStudioPhotosToStorage(imageFiles, photos, albumFolderRef.current);
    setFiles((current) => current.map((photo) => uploadedPhotos.find((uploaded) => uploaded.id === photo.id) || photo));
  };

  const continueToStudio = () => {
    if (files.some((file) => file.uploading || file.uploadError)) return;
    onContinueWithPhotos?.(product.slug, {
      albumFolder: albumFolderRef.current,
      photos: files.map(stripRuntimePhotoFields),
    });
    navigate("studio", {
      slug: product.slug,
      size: params?.size || "",
      pages: params?.pages || "",
      cover: params?.cover || "",
      paper: params?.paper || "",
      qty: params?.qty || "",
    });
  };

  const requestProfessionalDesign = () => {
    if (!files.length || files.some((file) => file.uploading || file.uploadError)) return;
    onProfessionalDesign?.(product.slug, {
      projectName: `${product.name} team design`,
      albumFolder: albumFolderRef.current,
      assets: files.map(stripRuntimePhotoFields),
      details: {
        ...selectedDetails,
      },
      qty: params?.qty || 1,
    });
    navigate("cart");
  };

  const lowQualityCount = files.filter(f => f.quality === "low").length;
  const uploadingCount = files.filter(f => f.uploading).length;
  const failedCount = files.filter(f => f.uploadError).length;
  const canContinue = uploadingCount === 0 && failedCount === 0;
  const canUseUploadedPhotos = files.length > 0 && canContinue;

  return (
    <div className="upload-page">
      <section style={{ padding: "40px 0 100px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 12, marginBottom: 24 }}>
            <a onClick={() => navigate("home")} style={{ cursor: "pointer" }}>Home</a><span>/</span>
            <a onClick={() => navigate("shop")} style={{ cursor: "pointer" }}>Shop</a><span>/</span>
            <a onClick={() => navigate("product", { slug: product.slug })} style={{ cursor: "pointer" }}>{product.name}</a><span>/</span>
            <span>Upload photos</span>
          </div>

          <Stepper current={1} navigate={navigate} slug={product.slug} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 60, marginTop: 60 }}>
            <div>
              <span className="eyebrow">Step 02</span>
              <h1 className="headline" style={{ marginTop: 12, marginBottom: 16, fontSize: "clamp(36px, 4vw, 52px)" }}>Upload your photographs.</h1>
              <p className="lede" style={{ marginBottom: 32 }}>
                Pick the photos you'd like in your <strong>{product.name}</strong>. Don't worry about getting it right — you can add, remove and reorder anytime in the Studio.
              </p>

              {/* Hi-res warning callout */}
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 20, marginBottom: 28, display: "flex", gap: 16, alignItems: "start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>!</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>High-resolution photos only</div>
                  <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                    For print-ready quality, upload original camera files (JPG, PNG, TIFF or HEIC) at <strong>300 DPI minimum</strong>. We recommend the longest edge be at least <strong>3000 pixels</strong>. Avoid screenshots, social media downloads and over-compressed files.
                  </div>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addSelectedFiles(e.dataTransfer.files); }}
                style={{
                  border: `2px dashed ${dragOver ? "var(--accent)" : "var(--line-2)"}`,
                  background: dragOver ? "rgba(154,107,63,0.06)" : "var(--paper)",
                  borderRadius: "var(--r-lg)", padding: "48px 24px", textAlign: "center", marginBottom: 28, transition: "all 0.2s"
                }}
              >
                <div style={{ width: 56, height: 56, margin: "0 auto 16px", borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div style={{ fontSize: 16, marginBottom: 8 }}>Drop your photos here</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>or <a onClick={() => inputRef.current?.click()} style={{ color: "var(--accent-deep)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>browse from your computer</a></div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 16, letterSpacing: 0.04 }}>
                  JPG · PNG · TIFF · HEIC · up to 50MB per file · stored on encrypted S3
                </div>
                <input ref={inputRef} type="file" accept="image/*,.heic,.heif,.tif,.tiff" multiple onChange={(event) => { addSelectedFiles(event.target.files); event.target.value = ""; }} style={{ display: "none" }} />
              </div>

              {/* Files */}
              {files.length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 13 }}>
                      <strong>{files.length}</strong> photos selected
                      {uploadingCount > 0 && (
                        <span style={{ marginLeft: 12, color: "var(--accent-deep)", fontSize: 12 }}>· {uploadingCount} uploading</span>
                      )}
                      {failedCount > 0 && (
                        <span style={{ marginLeft: 12, color: "var(--rust)", fontSize: 12 }}>· {failedCount} failed</span>
                      )}
                      {lowQualityCount > 0 && (
                        <span style={{ marginLeft: 12, color: "var(--rust)", fontSize: 12 }}>· {lowQualityCount} need attention</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setFiles((current) => [...current].sort((a, b) => String(a.name).localeCompare(String(b.name))))}>Sort by name</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setFiles([])} style={{ color: "var(--rust)" }}>Remove all</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {files.map((f) => (
                      <div key={f.id} style={{ position: "relative", borderRadius: "var(--r-md)", overflow: "hidden", border: f.quality === "low" ? "2px solid var(--rust)" : "1px solid var(--line)" }}>
                        <div style={{ aspectRatio: "1" }}>
                          <SmartImage src={f.src} className="img-fill" />
                        </div>
                        {f.quality === "low" && (
                          <div style={{ position: "absolute", top: 8, left: 8, right: 8, padding: "6px 8px", background: "rgba(168,87,48,0.95)", color: "white", borderRadius: 6, fontSize: 10, letterSpacing: 0.04, textAlign: "center" }}>
                            Low resolution
                          </div>
                        )}
                        {(f.uploading || f.uploadError) && (
                          <div style={{ position: "absolute", left: 8, bottom: 48, right: 8, padding: "6px 8px", background: f.uploadError ? "rgba(168,87,48,0.95)" : "rgba(28,26,23,0.82)", color: "white", borderRadius: 6, fontSize: 10, letterSpacing: 0.04, textAlign: "center" }} title={f.uploadError || ""}>
                            {f.uploadError ? "Upload failed" : "Uploading"}
                          </div>
                        )}
                        <div style={{ position: "absolute", top: 8, right: 8 }}>
                          <button className="icon-btn" onClick={() => setFiles((current) => current.filter((item) => item.id !== f.id))} style={{ width: 26, height: 26, background: "rgba(255,255,255,0.9)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                        <div style={{ padding: "8px 10px", background: "var(--paper)", fontSize: 11, lineHeight: 1.4 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                          <div style={{ color: "var(--muted)", fontSize: 10 }}>{f.res} · {f.sizeLabel || formatUploadFileSize(f.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside style={{ position: "sticky", top: 120, alignSelf: "start" }}>
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "var(--r-sm)", overflow: "hidden", flexShrink: 0 }}>
                    <SmartImage src={product.image} className="img-fill" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.06, textTransform: "uppercase" }}>{product.tier}</div>
                    <div style={{ fontSize: 16, marginTop: 2, marginBottom: 2 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{[selectedDetails.size, selectedDetails.pages ? `${selectedDetails.pages} pages` : "", selectedDetails.cover].filter(Boolean).join(" · ")}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--muted)" }}>Recommended photos</span>
                    <span>40–60</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--muted)" }}>Selected so far</span>
                    <span>{files.length}</span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: "100%", opacity: canContinue ? 1 : 0.55, cursor: canContinue ? "pointer" : "default" }} onClick={continueToStudio} disabled={!canContinue}>
                  {uploadingCount > 0 ? "Uploading photos..." : failedCount > 0 ? "Remove failed uploads" : "Continue to Design Studio →"}
                </button>
                <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10, opacity: canUseUploadedPhotos ? 1 : 0.55, cursor: canUseUploadedPhotos ? "pointer" : "default" }} onClick={requestProfessionalDesign} disabled={!canUseUploadedPhotos}>
                  Let our team design it
                </button>
                <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 12 }}>
                  Choose Studio to design yourself, or let our internal team build it from these uploaded photos.
                </div>
              </div>

              <div style={{ padding: 20, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "start", marginBottom: 12 }}>
                  <span style={{ color: "var(--accent)" }}>✦</span>
                  <span>Don't have time? <a style={{ color: "var(--accent-deep)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Let our designers build it</a> — free with every order.</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stepper({ current, navigate, slug }) {
  const steps = [
    { n: 1, label: "Choose book", page: "product" },
    { n: 2, label: "Upload photos", page: "upload" },
    { n: 3, label: "Design Studio", page: "studio" },
    { n: 4, label: "Review & checkout", page: "checkout" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <button onClick={() => navigate(s.page, { slug })} style={{ display: "flex", alignItems: "center", gap: 10, opacity: i <= current ? 1 : 0.45, cursor: "pointer" }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: i <= current ? "var(--ink)" : "var(--bg-3)", color: i <= current ? "var(--paper)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{i < current ? "✓" : s.n}</span>
            <span style={{ fontSize: 13 }}>{s.label}</span>
          </button>
          {i < steps.length - 1 && <span style={{ flex: 1, maxWidth: 40, height: 1, background: "var(--line)" }}></span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============ DESIGN STUDIO (deep) ============
const STUDIO_LAYOUT_SLOTS = {
  cover: [{ id: "cover-photo", x: 12, y: 12, w: 76, h: 48 }],
  "back-cover": [{ id: "back-cover-photo", x: 12, y: 12, w: 76, h: 48 }],
  title: [{ id: "title-photo", x: 55, y: 10, w: 35, h: 80 }],
  "full-bleed": [{ id: "full-photo", x: 0, y: 0, w: 100, h: 100 }],
  "1+1": [
    { id: "left-photo", x: 5, y: 10, w: 40, h: 80 },
    { id: "right-photo", x: 55, y: 10, w: 40, h: 80 },
  ],
  "3+1": [
    { id: "hero-left", x: 5, y: 8, w: 40, h: 42 },
    { id: "small-left-a", x: 5, y: 54, w: 19, h: 38 },
    { id: "small-left-b", x: 26, y: 54, w: 19, h: 38 },
    { id: "right-photo", x: 55, y: 8, w: 40, h: 84 },
  ],
  "1+text": [{ id: "left-photo", x: 5, y: 10, w: 40, h: 80 }],
  "2+2": [
    { id: "left-top", x: 5, y: 8, w: 40, h: 40 },
    { id: "left-bottom", x: 5, y: 52, w: 40, h: 40 },
    { id: "right-top", x: 55, y: 8, w: 40, h: 40 },
    { id: "right-bottom", x: 55, y: 52, w: 40, h: 40 },
  ],
  grid: [
    { id: "grid-1", x: 5, y: 10, w: 40, h: 35 },
    { id: "grid-2", x: 55, y: 10, w: 40, h: 35 },
    { id: "grid-3", x: 5, y: 55, w: 40, h: 35 },
    { id: "grid-4", x: 55, y: 55, w: 40, h: 35 },
  ],
  centered: [{ id: "center-photo", x: 20, y: 18, w: 60, h: 64 }],
  blank: [],
};

const DEFAULT_SPREAD_BACKGROUND = "#FBF8F2";
const BACKGROUND_SWATCHES = ["#FBF8F2", "#F4EFE6", "#E4DBC9", "#FFFFFF", "#1C1A17", "#3A1F1A", "#7A8569", "#9A6B3F", "#7A2A2A"];
function resolveStudioApiBaseUrl(rawValue) {
  const configured = (rawValue || "").trim().replace(/\/$/, "");
  if (configured.includes("localhost") && import.meta.env.PROD) return "";
  if (configured) return configured;
  if (import.meta.env.DEV && typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port && window.location.port !== "3000") {
    return "http://localhost:3000";
  }
  return "";
}

const STUDIO_API_BASE_URL = resolveStudioApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

function isCoverLayout(layout) {
  return layout === "cover" || layout === "back-cover";
}

function clampStudioValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function studioApiUrl(path) {
  return `${STUDIO_API_BASE_URL}${path}`;
}

async function uploadToSignedStorageUrl(uploadUrl, fileBody, { fileName, contentType = "application/octet-stream", cacheControl = "3600" } = {}) {
  const headers = { "x-upsert": "true" };
  let body = fileBody;

  if (typeof FormData !== "undefined" && typeof Blob !== "undefined" && fileBody instanceof Blob) {
    body = new FormData();
    body.append("cacheControl", cacheControl);
    body.append("", fileBody, fileName || "upload");
  } else {
    headers["Content-Type"] = contentType;
    headers["cache-control"] = `max-age=${cacheControl}`;
  }

  return fetch(uploadUrl, {
    method: "PUT",
    headers,
    body,
  });
}

function cleanStorageName(value, fallback = "album") {
  return String(value || fallback)
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || fallback;
}

function storageTimestamp(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:.]/g, "-");
}

function createAlbumStorageFolder(projectName) {
  return `albums/${cleanStorageName(projectName || "album-design", "album")}-${storageTimestamp()}`;
}

function buildAlbumStoragePath(albumFolder, section, fileName) {
  const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${albumFolder}/${section}/${id}-${cleanStorageName(fileName || "asset", "asset")}`;
}

async function uploadStudioPhotosToStorage(files, pendingPhotos, albumFolder) {
  return Promise.all(pendingPhotos.map(async (photo, index) => {
    const file = files[index] || photo.file;
    if (!file) return photo;

    try {
      const signResponse = await fetch(studioApiUrl("/api/upload-url"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
          path: buildAlbumStoragePath(albumFolder, "photos", file.name),
        }),
      });
      const signData = await signResponse.json().catch(() => ({}));
      if (!signResponse.ok) {
        throw new Error(signData.error || `Photo upload setup failed with ${signResponse.status}`);
      }
      if (!signData.uploadUrl) {
        throw new Error("The upload endpoint did not return a signed URL.");
      }

      const uploadResponse = await uploadToSignedStorageUrl(signData.uploadUrl, file, {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text().catch(() => "");
        throw new Error(`Supabase photo upload failed with ${uploadResponse.status}${uploadError ? `: ${uploadError}` : ""}`);
      }

      const previewResponse = await fetch(studioApiUrl(`/api/photo-url?bucket=${encodeURIComponent(signData.bucket)}&path=${encodeURIComponent(signData.path)}`));
      const previewData = await previewResponse.json().catch(() => ({}));
      if (!previewResponse.ok) {
        throw new Error(previewData.error || `Photo preview setup failed with ${previewResponse.status}`);
      }

      return {
        ...photo,
        localSrc: photo.src,
        src: previewData.signedUrl || photo.src,
        storagePath: signData.path,
        storageBucket: signData.bucket,
        uploading: false,
        uploaded: true,
      };
    } catch (error) {
      return {
        ...photo,
        uploading: false,
        uploaded: false,
        uploadError: error.message || "Photo upload failed; using a temporary preview.",
      };
    }
  }));
}

function photoPatch(photoOrSrc) {
  if (typeof photoOrSrc === "string") return { src: photoOrSrc };
  if (!photoOrSrc) return { src: "" };

  return {
    src: photoOrSrc.src || "",
    storagePath: photoOrSrc.storagePath || photoOrSrc.path || "",
    storageBucket: photoOrSrc.storageBucket || photoOrSrc.bucket || "",
    fileName: photoOrSrc.fileName || photoOrSrc.name || "",
    contentType: photoOrSrc.contentType || "",
  };
}

function clearPhotoPatch() {
  return { src: "", storagePath: "", storageBucket: "", fileName: "", contentType: "" };
}

function copyPhotoMetadata(item) {
  return photoPatch(item);
}

function makeStudioItem(slot, src, index) {
  return {
    id: `${slot.id}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    src: src || "",
    x: slot.x,
    y: slot.y,
    w: slot.w,
    h: slot.h,
    focalX: 50,
    focalY: 50,
    rotation: 0,
  };
}

function normalizeStudioItem(item) {
  return {
    ...item,
    focalX: item.focalX ?? 50,
    focalY: item.focalY ?? 50,
    storagePath: item.storagePath || "",
    storageBucket: item.storageBucket || "",
    fileName: item.fileName || "",
    contentType: item.contentType || "",
  };
}

function makeStudioTextItem(preset = "body", index = 0) {
  const presets = {
    heading: { text: "Add heading", x: 18, y: 18, w: 36, h: 16, fontSize: 30, fontWeight: 600, lineHeight: 1.08 },
    body: { text: "Add your story", x: 56, y: 34, w: 32, h: 24, fontSize: 18, fontWeight: 400, lineHeight: 1.35 },
    caption: { text: "Caption", x: 12, y: 82, w: 28, h: 8, fontSize: 11, fontWeight: 500, lineHeight: 1.2 },
  };
  const base = presets[preset] || presets.body;
  return {
    id: `text-${preset}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    fontFamily: "var(--font)",
    fontStyle: "normal",
    textDecoration: "none",
    textAlign: "left",
    color: "#2E2A25",
    letterSpacing: 0,
    textTransform: "none",
    opacity: 100,
    background: "transparent",
    padding: 0,
    borderRadius: 0,
    ...base,
  };
}

function layoutSlots(layout) {
  return STUDIO_LAYOUT_SLOTS[layout] || STUDIO_LAYOUT_SLOTS["full-bleed"];
}

function createItemsForLayout(layout, photos = [], previousItems = []) {
  const previousSources = previousItems.map((item) => item.src).filter(Boolean);
  const previousBySource = new Map(previousItems.filter((item) => item.src).map((item) => [item.src, item]));
  const sources = [...previousSources, ...photos].filter(Boolean);
  return layoutSlots(layout).map((slot, index) => {
    const source = sources[index] || "";
    const previous = source ? previousBySource.get(source) : previousItems[index];
    return normalizeStudioItem({
      ...makeStudioItem(slot, source, index),
      ...copyPhotoMetadata(previous),
      src: source,
      focalX: previous?.focalX ?? 50,
      focalY: previous?.focalY ?? 50,
    });
  });
}

function normalizeStudioSpread(spread) {
  return {
    ...spread,
    backgroundColor: spread.backgroundColor || DEFAULT_SPREAD_BACKGROUND,
    items: spread.items ? spread.items.map(normalizeStudioItem) : createItemsForLayout(spread.layout, spread.photos || []),
    textItems: spread.textItems || [],
  };
}

function defaultStudioSpreads() {
  return [
    { type: "cover", title: "COVER", layout: "cover", photos: [] },
    { type: "title", title: "Title", layout: "title", photos: [] },
    { type: "spread", title: "Spread 1", layout: "1+1", photos: [] },
    { type: "spread", title: "Spread 2", layout: "full-bleed", photos: [] },
    { type: "spread", title: "Spread 3", layout: "3+1", photos: [] },
    { type: "spread", title: "Spread 4", layout: "1+text", photos: [] },
    { type: "spread", title: "Spread 5", layout: "2+2", photos: [] },
    { type: "back-cover", title: "BACK COVER", layout: "back-cover", photos: [] },
  ].map(normalizeStudioSpread);
}

function cloneStudioSpreads(spreads) {
  return spreads.map((spread) => ({
    ...spread,
    backgroundColor: spread.backgroundColor || DEFAULT_SPREAD_BACKGROUND,
    items: (spread.items || []).map((item) => ({ ...item })),
    textItems: (spread.textItems || []).map((item) => ({ ...item })),
  }));
}

function shuffleStudioPhotos(photos) {
  const shuffled = [...photos];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function isEditableTarget(target) {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function filledStudioSlots(spreads) {
  return spreads.reduce((total, spread) => total + (spread.items || []).filter((item) => Boolean(item.src)).length, 0);
}

function requiredStudioSlots(spreads) {
  return spreads.reduce((total, spread) => total + (spread.items || []).length, 0);
}

function isStudioAlbumReady(spreads) {
  const required = requiredStudioSlots(spreads);
  return required > 0 && filledStudioSlots(spreads) === required;
}

function photoLibraryFromDesign(spreads) {
  const uniqueSources = [...new Set(spreads.flatMap((spread) => (spread.items || []).map((item) => item.src).filter(Boolean)))];
  return uniqueSources.map((src, index) => ({
    id: `design-photo-${index}`,
    name: `Design photo ${index + 1}`,
    src,
  }));
}

function escapePdfText(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

async function getImageSize(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
    img.onerror = () => resolve({ width: 1200, height: 800 });
    img.src = src;
  });
}

async function convertImageToPdfJpeg(src, options = {}) {
  const maxDimension = options.maxDimension || 2400;
  const quality = options.quality ?? 0.88;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || 1200;
        const naturalHeight = img.naturalHeight || 800;
        const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
        const width = Math.max(1, Math.round(naturalWidth * scale));
        const height = Math.max(1, Math.round(naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.fillStyle = "#FBF8F2";
        context.fillRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("Could not render image for PDF."));
            return;
          }
          resolve({ width, height, bytes: new Uint8Array(await blob.arrayBuffer()) });
        }, "image/jpeg", quality);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function loadOriginalPdfJpeg(src) {
  const [response, size] = await Promise.all([fetch(src, { mode: "cors" }), getImageSize(src)]);
  const blob = await response.blob();
  if (!blob.type.includes("jpeg") && !blob.type.includes("jpg")) return null;
  return { ...size, bytes: new Uint8Array(await blob.arrayBuffer()) };
}

async function loadPdfImage(src, options = {}) {
  if (options.preferOriginal) {
    try {
      const originalImage = await loadOriginalPdfJpeg(src);
      if (originalImage) return originalImage;
    } catch {
      // Fall through to canvas rendering for formats that cannot be embedded directly.
    }
  }

  try {
    return await convertImageToPdfJpeg(src, options);
  } catch {
    // Some remote images disallow canvas reads; direct JPEG embedding still works when fetch is permitted.
  }
  if (options.allowOriginalFallback === false) return null;
  try {
    return await loadOriginalPdfJpeg(src);
  } catch {
    return null;
  }
}

function studioPdfRect(item, pageWidth, pageHeight) {
  const x = (item.x / 100) * pageWidth;
  const w = (item.w / 100) * pageWidth;
  const h = (item.h / 100) * pageHeight;
  const y = pageHeight - ((item.y / 100) * pageHeight) - h;
  return { x, y, w, h };
}

function drawPdfText(x, y, size, text) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET\n`;
}

function pdfColor(value, fallback = [0.18, 0.16, 0.14]) {
  if (!value || value === "transparent" || !value.startsWith("#")) return fallback;
  const hex = value.slice(1);
  if (hex.length !== 6) return fallback;
  return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
}

function drawPdfTextBlock(item, pageWidth, pageHeight) {
  const rect = studioPdfRect(item, pageWidth, pageHeight);
  const [r, g, b] = pdfColor(item.color);
  const fontSize = item.fontSize || 14;
  const padding = item.padding || 0;
  const lineHeight = fontSize * (item.lineHeight || 1.25);
  const lines = String(item.text || "").split("\n");
  let content = `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
  lines.forEach((line, index) => {
    const visibleText = item.textTransform === "uppercase" ? line.toUpperCase() : item.textTransform === "lowercase" ? line.toLowerCase() : line;
    const estimatedWidth = visibleText.length * fontSize * 0.5;
    const alignOffset = item.textAlign === "center" ? Math.max(0, (rect.w - estimatedWidth) / 2) : item.textAlign === "right" ? Math.max(0, rect.w - estimatedWidth - padding) : padding;
    const x = rect.x + alignOffset;
    const y = rect.y + rect.h - padding - fontSize - (index * lineHeight);
    if (y > rect.y) content += drawPdfText(x, y, fontSize, visibleText);
  });
  return content;
}

export async function createStudioPdfBlob(spreads, options = {}) {
  const uniqueSources = [...new Set(spreads.flatMap((spread) => (spread.items || []).map((item) => item.src).filter(Boolean)))];
  const imageOptions = options.image || {};
  const loadedImages = new Map();
  await Promise.all(uniqueSources.map(async (src, index) => {
    const image = await loadPdfImage(src, imageOptions);
    if (image) loadedImages.set(src, { ...image, name: `Im${index}` });
  }));

  const objects = [];
  const reserve = () => {
    objects.push(null);
    return objects.length;
  };
  const setObject = (id, value) => { objects[id - 1] = value; };
  const addObject = (value) => {
    objects.push(value);
    return objects.length;
  };
  const encoder = new TextEncoder();
  const streamObject = (content) => {
    const bytes = typeof content === "string" ? encoder.encode(content) : content;
    return [encoder.encode(`<< /Length ${bytes.length} >>\nstream\n`), bytes, encoder.encode("\nendstream")];
  };

  const catalogId = reserve();
  const pagesId = reserve();
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const imageObjectIds = new Map();
  loadedImages.forEach((image, src) => {
    const header = `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`;
    const objectId = addObject([encoder.encode(header), image.bytes, encoder.encode("\nendstream")]);
    imageObjectIds.set(src, objectId);
  });

  const pageIds = spreads.map((spread) => {
    const pageWidth = isCoverLayout(spread.layout) ? 360 : 720;
    const pageHeight = 360;
    const [bgR, bgG, bgB] = pdfColor(spread.backgroundColor || DEFAULT_SPREAD_BACKGROUND, [0.984, 0.973, 0.949]);
    let content = `${bgR.toFixed(3)} ${bgG.toFixed(3)} ${bgB.toFixed(3)} rg 0 0 ${pageWidth} ${pageHeight} re f\n`;
    if (!isCoverLayout(spread.layout)) content += "0.85 0.82 0.75 RG 0.5 w 360 0 m 360 360 l S\n";

    (spread.items || []).forEach((item) => {
      const rect = studioPdfRect(item, pageWidth, pageHeight);
      const image = loadedImages.get(item.src);
      if (!image || !imageObjectIds.has(item.src)) {
        content += `0.89 0.86 0.78 rg ${rect.x} ${rect.y} ${rect.w} ${rect.h} re f\n`;
        content += drawPdfText(rect.x + 12, rect.y + rect.h / 2, 10, "Image");
        return;
      }
      const imageRatio = image.width / image.height;
      const slotRatio = rect.w / rect.h;
      let drawW = rect.w;
      let drawH = rect.h;
      let drawX = rect.x;
      let drawY = rect.y;
      if (imageRatio > slotRatio) {
        drawH = rect.h;
        drawW = rect.h * imageRatio;
        drawX = rect.x - ((drawW - rect.w) * ((item.focalX ?? 50) / 100));
      } else {
        drawW = rect.w;
        drawH = rect.w / imageRatio;
        drawY = rect.y - ((drawH - rect.h) * (1 - ((item.focalY ?? 50) / 100)));
      }
      content += `q ${rect.x} ${rect.y} ${rect.w} ${rect.h} re W n ${drawW} 0 0 ${drawH} ${drawX} ${drawY} cm /${image.name} Do Q\n`;
    });
    (spread.textItems || []).forEach((item) => {
      content += drawPdfTextBlock(item, pageWidth, pageHeight);
    });

    const contentId = addObject(streamObject(content));
    const pageId = reserve();
    const xObjects = [...loadedImages.entries()].map(([src, image]) => `/${image.name} ${imageObjectIds.get(src)} 0 R`).join(" ");
    setObject(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> /XObject << ${xObjects} >> >> /Contents ${contentId} 0 R >>`);
    return pageId;
  });

  setObject(pagesId, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  setObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  const parts = [encoder.encode("%PDF-1.4\n")];
  const offsets = [0];
  let length = parts[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    const prefix = encoder.encode(`${index + 1} 0 obj\n`);
    const body = Array.isArray(object) ? object : [encoder.encode(String(object))];
    const suffix = encoder.encode("\nendobj\n");
    parts.push(prefix, ...body, suffix);
    length += prefix.length + body.reduce((sum, part) => sum + part.length, 0) + suffix.length;
  });
  const xrefOffset = length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { xref += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  parts.push(encoder.encode(xref));

  return new Blob(parts, { type: "application/pdf" });
}

export async function downloadStudioPdf(spreads, projectName) {
  const blob = await createStudioPdfBlob(spreads);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(projectName || "safarnama-album").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "safarnama-album"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function StudioPage({ navigate, params, products = [], SmartImage = DefaultSmartImage, Logo = DefaultLogo, initialAlbumDesign = null, initialPhotoLibrary = [], initialAlbumFolder = "", onSaveAlbumDesign }) {
  const product = products.find(p => p.slug === params?.slug) || products[0];
  const [activeTool, setActiveTool] = useState("photos");
  const [activeSpread, setActiveSpread] = useState(0);
  const [aspectFilter, setAspectFilter] = useState("4:3");
  const [zoom, setZoom] = useState(100);
  const [projectName, setProjectName] = useState(initialAlbumDesign?.projectName || "Album design");
  const [savedAt, setSavedAt] = useState("11:42 AM");
  const [selectedItemIdsBySpread, setSelectedItemIdsBySpread] = useState({});
  const [selectedTextIdsBySpread, setSelectedTextIdsBySpread] = useState({});
  const [exportingPdf, setExportingPdf] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const uploadInputRef = useRef(null);
  const albumFolderRef = useRef(initialAlbumDesign?.albumFolder || initialAlbumDesign?.storageFolder || initialAlbumFolder || "");
  const historyRef = useRef([]);
  const clipboardRef = useRef(null);
  const [photoBin, setPhotoBin] = useState(() => initialAlbumDesign?.photoLibrary || (initialPhotoLibrary?.length ? initialPhotoLibrary : photoLibraryFromDesign(initialAlbumDesign?.spreads || [])));

  // Spreads (left/right pages)
  const [spreads, setSpreads] = useState(() => initialAlbumDesign?.spreads?.length ? initialAlbumDesign.spreads.map(normalizeStudioSpread) : defaultStudioSpreads());

  const getAlbumFolder = () => {
    if (!albumFolderRef.current) {
      albumFolderRef.current = createAlbumStorageFolder(projectName);
    }
    return albumFolderRef.current;
  };

  const activeSpreadData = spreads[activeSpread];
  const activeLayout = activeSpreadData?.layout || "full-bleed";
  const activeBackgroundColor = activeSpreadData?.backgroundColor || DEFAULT_SPREAD_BACKGROUND;
  const selectedItemId = selectedItemIdsBySpread[activeSpread] || null;
  const selectedTextId = selectedTextIdsBySpread[activeSpread] || null;
  const selectedItem = activeSpreadData?.items?.find((item) => item.id === selectedItemId) || null;
  const selectedText = activeSpreadData?.textItems?.find((item) => item.id === selectedTextId) || null;
  const filledSlots = filledStudioSlots(spreads);
  const totalSlots = requiredStudioSlots(spreads);
  const albumReady = isStudioAlbumReady(spreads);

  const setSelectedItemForSpread = (spreadIndex, itemId) => {
    setSelectedItemIdsBySpread((current) => ({
      ...current,
      [spreadIndex]: itemId || null,
    }));
  };

  const setSelectedTextForSpread = (spreadIndex, itemId) => {
    setSelectedTextIdsBySpread((current) => ({
      ...current,
      [spreadIndex]: itemId || null,
    }));
  };

  const selectTextItem = (itemId) => {
    setSelectedTextForSpread(activeSpread, itemId);
    setSelectedItemForSpread(activeSpread, null);
    if (itemId) setActiveTool("text");
  };

  useEffect(() => {
    const activeItems = activeSpreadData?.items || [];
    if (selectedItemId && !activeItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemForSpread(activeSpread, null);
    }
    const activeTextItems = activeSpreadData?.textItems || [];
    if (selectedTextId && !activeTextItems.some((item) => item.id === selectedTextId)) {
      setSelectedTextForSpread(activeSpread, null);
    }
  }, [activeSpread, activeSpreadData, selectedItemId, selectedTextId]);

  const saveHistorySnapshot = () => {
    setSpreads((current) => {
      historyRef.current = [...historyRef.current.slice(-39), cloneStudioSpreads(current)];
      return current;
    });
  };

  const updateSpread = (spreadIndex, updater, options = {}) => {
    const { trackHistory = true } = options;
    setSpreads((current) => {
      if (trackHistory) {
        historyRef.current = [...historyRef.current.slice(-39), cloneStudioSpreads(current)];
      }
      return current.map((spread, index) => index === spreadIndex ? updater(spread) : spread);
    });
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  const updateActiveSpread = (updater, options) => {
    updateSpread(activeSpread, updater, options);
  };

  const updateItem = (itemId, patch, options) => {
    updateActiveSpread((spread) => ({
      ...spread,
      items: (spread.items || []).map((item) => item.id === itemId ? {
        ...item,
        ...patch,
        x: patch.x === undefined ? item.x : clampStudioValue(patch.x, 0, 100 - item.w),
        y: patch.y === undefined ? item.y : clampStudioValue(patch.y, 0, 100 - item.h),
        w: patch.w === undefined ? item.w : clampStudioValue(patch.w, 8, 100 - item.x),
        h: patch.h === undefined ? item.h : clampStudioValue(patch.h, 8, 100 - item.y),
        focalX: patch.focalX === undefined ? item.focalX ?? 50 : clampStudioValue(patch.focalX, 0, 100),
        focalY: patch.focalY === undefined ? item.focalY ?? 50 : clampStudioValue(patch.focalY, 0, 100),
      } : item),
    }), options);
  };

  const updateTextItem = (itemId, patch, options) => {
    updateActiveSpread((spread) => ({
      ...spread,
      textItems: (spread.textItems || []).map((item) => item.id === itemId ? {
        ...item,
        ...patch,
        x: patch.x === undefined ? item.x : clampStudioValue(patch.x, 0, 100 - item.w),
        y: patch.y === undefined ? item.y : clampStudioValue(patch.y, 0, 100 - item.h),
        w: patch.w === undefined ? item.w : clampStudioValue(patch.w, 8, 100 - item.x),
        h: patch.h === undefined ? item.h : clampStudioValue(patch.h, 6, 100 - item.y),
      } : item),
    }), options);
  };

  const addTextItem = (preset) => {
    const spreadIndex = activeSpread;
    updateSpread(spreadIndex, (spread) => {
      const textItems = spread.textItems || [];
      const newItem = makeStudioTextItem(preset, textItems.length);
      setSelectedTextForSpread(spreadIndex, newItem.id);
      setSelectedItemForSpread(spreadIndex, null);
      setActiveTool("text");
      return { ...spread, textItems: [...textItems, newItem] };
    });
  };

  const removeTextItem = (itemId) => {
    updateActiveSpread((spread) => ({
      ...spread,
      textItems: (spread.textItems || []).filter((item) => item.id !== itemId),
    }));
    setSelectedTextForSpread(activeSpread, null);
  };

  const addImageSection = () => {
    const spreadIndex = activeSpread;
    updateSpread(spreadIndex, (spread) => {
      const items = spread.items || [];
      const offset = (items.length % 5) * 4;
      const newItem = makeStudioItem({
        id: "custom-photo-section",
        x: clampStudioValue(28 + offset, 0, 66),
        y: clampStudioValue(24 + offset, 0, 62),
        w: 34,
        h: 38,
      }, "", items.length);
      setSelectedItemForSpread(spreadIndex, newItem.id);
      setSelectedTextForSpread(spreadIndex, null);
      return { ...spread, items: [...items, newItem] };
    });
  };

  const removeImageSection = (itemId) => {
    updateActiveSpread((spread) => ({
      ...spread,
      items: (spread.items || []).filter((item) => item.id !== itemId),
    }));
    setSelectedItemForSpread(activeSpread, null);
  };

  const updateActiveBackground = (backgroundColor) => {
    updateActiveSpread((spread) => ({
      ...spread,
      backgroundColor,
    }));
  };

  const undoLastChange = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    setSpreads(previous);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  const deleteSelection = () => {
    if (selectedText) {
      removeTextItem(selectedText.id);
      return;
    }
    if (selectedItem) {
      updateItem(selectedItem.id, clearPhotoPatch());
    }
  };

  const copySelection = () => {
    if (selectedText) {
      clipboardRef.current = { type: "text", item: { ...selectedText } };
      const writePromise = window.navigator?.clipboard?.writeText?.(selectedText.text || "");
      writePromise?.catch?.(() => {});
      return true;
    }
    if (selectedItem?.src) {
      clipboardRef.current = { type: "photo", photo: copyPhotoMetadata(selectedItem) };
      return true;
    }
    return false;
  };

  const cutSelection = () => {
    if (!copySelection()) return;
    deleteSelection();
  };

  const pasteSelection = async () => {
    const clip = clipboardRef.current;
    const spreadIndex = activeSpread;
    if (clip?.type === "text") {
      updateSpread(spreadIndex, (spread) => {
        const textItems = spread.textItems || [];
        const pasted = {
          ...clip.item,
          id: `text-paste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          x: clampStudioValue((clip.item.x || 18) + 4, 0, 100 - (clip.item.w || 30)),
          y: clampStudioValue((clip.item.y || 18) + 4, 0, 100 - (clip.item.h || 12)),
        };
        setSelectedTextForSpread(spreadIndex, pasted.id);
        setSelectedItemForSpread(spreadIndex, null);
        setActiveTool("text");
        return { ...spread, textItems: [...textItems, pasted] };
      });
      return;
    }
    if (clip?.type === "photo" && (clip.photo?.src || clip.src)) {
      updateSpread(spreadIndex, (spread) => {
        const items = spread.items || [];
        const patch = photoPatch(clip.photo || clip.src);
        const newItem = { ...makeStudioItem({ id: "pasted-photo", x: 30, y: 28, w: 32, h: 36 }, patch.src, items.length), ...patch };
        setSelectedItemForSpread(spreadIndex, newItem.id);
        setSelectedTextForSpread(spreadIndex, null);
        return { ...spread, items: [...items, newItem] };
      });
      return;
    }
    const readPromise = window.navigator?.clipboard?.readText?.();
    const clipboardText = readPromise ? await readPromise.catch(() => "") : "";
    if (clipboardText) {
      updateSpread(spreadIndex, (spread) => {
        const textItems = spread.textItems || [];
        const newItem = { ...makeStudioTextItem("body", textItems.length), text: clipboardText };
        setSelectedTextForSpread(spreadIndex, newItem.id);
        setSelectedItemForSpread(spreadIndex, null);
        setActiveTool("text");
        return { ...spread, textItems: [...textItems, newItem] };
      });
    }
  };

  const placePhoto = (photo, targetItemId, point) => {
    const spreadIndex = activeSpread;
    const patch = { ...photoPatch(photo), focalX: 50, focalY: 50 };
    updateSpread(spreadIndex, (spread) => {
      const items = spread.items || [];
      if (targetItemId && items.some((item) => item.id === targetItemId)) {
        setSelectedItemForSpread(spreadIndex, targetItemId);
        setSelectedTextForSpread(spreadIndex, null);
        return { ...spread, items: items.map((item) => item.id === targetItemId ? { ...item, ...patch } : item) };
      }
      const emptyItem = items.find((item) => !item.src);
      if (emptyItem) {
        setSelectedItemForSpread(spreadIndex, emptyItem.id);
        setSelectedTextForSpread(spreadIndex, null);
        return { ...spread, items: items.map((item) => item.id === emptyItem.id ? { ...item, ...patch } : item) };
      }
      const customSlot = { id: "custom-photo", x: point?.x ?? 30, y: point?.y ?? 30, w: 28, h: 32 };
      const newItem = { ...makeStudioItem(customSlot, patch.src, items.length), ...patch };
      setSelectedItemForSpread(spreadIndex, newItem.id);
      setSelectedTextForSpread(spreadIndex, null);
      return { ...spread, items: [...items, newItem] };
    });
  };

  const applyLayout = (layout) => {
    const spreadIndex = activeSpread;
    updateSpread(spreadIndex, (spread) => {
      const items = createItemsForLayout(layout, spread.photos || [], spread.items || []);
      const previousSelection = selectedItemIdsBySpread[spreadIndex];
      setSelectedItemForSpread(spreadIndex, items.some((item) => item.id === previousSelection) ? previousSelection : null);
      const isFrontCover = layout === "cover";
      const isBackCover = layout === "back-cover";
      return {
        ...spread,
        type: isFrontCover ? "cover" : isBackCover ? "back-cover" : isCoverLayout(spread.type) ? "spread" : spread.type,
        title: isFrontCover ? "COVER" : isBackCover ? "BACK COVER" : spread.title,
        layout,
        items,
      };
    });
  };

  const handleAddSpread = () => {
    let insertedIndex = spreads.length;
    setSpreads((current) => {
      historyRef.current = [...historyRef.current.slice(-39), cloneStudioSpreads(current)];
      insertedIndex = current.findIndex((spread) => spread.layout === "back-cover");
      if (insertedIndex < 0) insertedIndex = current.length;
      const insideSpreadCount = current.filter((spread) => !isCoverLayout(spread.layout)).length;
      const newSpread = normalizeStudioSpread({ type: "spread", title: `Spread ${insideSpreadCount}`, layout: "1+1", photos: [] });
      return [
        ...current.slice(0, insertedIndex),
        newSpread,
        ...current.slice(insertedIndex),
      ];
    });
    setActiveSpread(insertedIndex);
    setActiveTool("photos");
  };

  const uploadPhotosToStorage = async (files, pendingPhotos) => {
    const uploadedPhotos = await uploadStudioPhotosToStorage(files, pendingPhotos, getAlbumFolder());

    setPhotoBin((current) => current.map((photo) => uploadedPhotos.find((uploaded) => uploaded.id === photo.id) || photo));
    setSpreads((current) => current.map((spread) => ({
      ...spread,
      items: (spread.items || []).map((item) => {
        const uploaded = uploadedPhotos.find((photo) => photo.uploaded && (item.src === photo.localSrc || item.id === photo.id));
        return uploaded ? { ...item, ...photoPatch(uploaded) } : item;
      }),
    })));
  };

  const handleUploadLibrary = async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    const pendingPhotos = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      src: URL.createObjectURL(file),
      file,
      uploading: true,
    }));
    setPhotoBin((current) => [...current, ...pendingPhotos]);
    event.target.value = "";
    await uploadPhotosToStorage(files, pendingPhotos);
  };

  const randomFillAllSpreads = () => {
    const availablePhotos = photoBin.filter((photo) => photo.src && !photo.uploading && !photo.uploadError);
    if (!availablePhotos.length) return;

    setSpreads((current) => {
      historyRef.current = [...historyRef.current.slice(-39), cloneStudioSpreads(current)];
      let deck = shuffleStudioPhotos(availablePhotos);
      let cursor = 0;
      return current.map((spread) => ({
        ...spread,
        items: (spread.items || []).map((item) => {
          if (cursor > 0 && cursor % deck.length === 0) deck = shuffleStudioPhotos(availablePhotos);
          const photo = deck[cursor % deck.length];
          cursor += 1;
          return {
            ...item,
            ...photoPatch(photo),
            focalX: 50,
            focalY: 50,
          };
        }),
      }));
    });
    setSelectedItemIdsBySpread({});
    setSelectedTextIdsBySpread({});
    setActiveSpread(0);
    setActiveTool("photos");
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  const restartDesignFromScratch = () => {
    setSpreads((current) => {
      historyRef.current = [...historyRef.current.slice(-39), cloneStudioSpreads(current)];
      return defaultStudioSpreads();
    });
    setSelectedItemIdsBySpread({});
    setSelectedTextIdsBySpread({});
    setActiveSpread(0);
    setActiveTool("photos");
    setSaveError("");
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  const autofillRemaining = () => {
    if (!photoBin.length) return;
    let cursor = 0;
    updateActiveSpread((spread) => ({
      ...spread,
      items: (spread.items || []).map((item) => {
        if (item.src) return item;
        const photo = photoBin[cursor % photoBin.length];
        cursor += 1;
        return { ...item, ...photoPatch(photo), focalX: 50, focalY: 50 };
      }),
    }));
  };

  const handleDownloadPdf = async () => {
    if (!albumReady || exportingPdf) return;
    setExportingPdf(true);
    try {
      await downloadStudioPdf(spreads, projectName);
    } finally {
      setExportingPdf(false);
    }
  };

  const uploadDesignPdf = async () => {
    const pdfBlob = await createStudioPdfBlob(spreads, {
      image: {
        maxDimension: Number.POSITIVE_INFINITY,
        quality: 1,
        preferOriginal: true,
      },
    });
    const savedStamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${cleanStorageName(projectName || "album-design", "album-design")}-${savedStamp}-design.pdf`;
    const targetAlbumFolder = getAlbumFolder();
    const signResponse = await fetch(studioApiUrl("/api/upload-url"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        contentType: "application/pdf",
        size: pdfBlob.size,
        path: buildAlbumStoragePath(targetAlbumFolder, "design", fileName),
      }),
    });
    const signData = await signResponse.json().catch(() => ({}));
    if (!signResponse.ok) {
      throw new Error(signData.error || `Design PDF upload setup failed with ${signResponse.status}`);
    }

    const uploadResponse = await uploadToSignedStorageUrl(signData.uploadUrl, pdfBlob, {
      fileName,
      contentType: "application/pdf",
    });
    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text().catch(() => "");
      throw new Error(`Design PDF upload failed with ${uploadResponse.status}${uploadError ? `: ${uploadError}` : ""}`);
    }

    const previewResponse = await fetch(studioApiUrl(`/api/photo-url?bucket=${encodeURIComponent(signData.bucket)}&path=${encodeURIComponent(signData.path)}`));
    const previewData = await previewResponse.json().catch(() => ({}));
    if (!previewResponse.ok) {
      throw new Error(previewData.error || `Design PDF preview setup failed with ${previewResponse.status}`);
    }

    return {
      src: previewData.signedUrl || "",
      storagePath: signData.path,
      storageBucket: signData.bucket,
      fileName,
      contentType: "application/pdf",
      size: pdfBlob.size,
      uploaded: true,
      savedAt: new Date().toISOString(),
    };
  };

  const buildAlbumDesign = (designPdf = null) => ({
    version: 1,
    cartItemId: params?.cartItemId || null,
    productSlug: product?.slug,
    projectName,
    albumFolder: getAlbumFolder(),
    details: {
      size: params?.size || product?.sizes?.[0] || "",
      pages: params?.pages || product?.pages?.[1] || product?.pages?.[0] || "",
      cover: params?.cover || product?.cover?.[0] || "",
      paper: params?.paper || product?.paper?.[0] || "",
    },
    qty: Number(params?.qty || 1),
    designPdf,
    isComplete: albumReady,
    filledSlots,
    totalSlots,
    spreadCount: spreads.length,
    pageCount: spreads.reduce((count, spread) => count + (isCoverLayout(spread.layout) ? 1 : 2), 0),
    photoLibrary: photoBin.map(({ file, localSrc, ...photo }) => ({ ...photo })),
    spreads: cloneStudioSpreads(spreads),
    savedAt: new Date().toISOString(),
  });

  const handleSaveAndCheckout = async () => {
    if (!albumReady || savingDesign) return;
    setSavingDesign(true);
    setSaveError("");
    try {
      const designPdf = await uploadDesignPdf();
      onSaveAlbumDesign?.(buildAlbumDesign(designPdf), product);
      navigate("cart");
    } catch (error) {
      setSaveError(error.message || "Could not save the album design PDF.");
    } finally {
      setSavingDesign(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const command = event.metaKey || event.ctrlKey;

      if (command && key === "z") {
        event.preventDefault();
        undoLastChange();
        return;
      }
      if (command && key === "x") {
        event.preventDefault();
        cutSelection();
        return;
      }
      if (command && key === "c") {
        if (copySelection()) event.preventDefault();
        return;
      }
      if (command && key === "v") {
        event.preventDefault();
        pasteSelection();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedText || selectedItem) {
          event.preventDefault();
          deleteSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSpread, selectedItem, selectedText]);

  return (
    <StudioComponentContext.Provider value={{ SmartImage, Logo }}>
      <div className="studio-app" style={{ background: "var(--ink)", color: "var(--paper)", height: "calc(100vh - 50px)", minHeight: 640, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top toolbar */}
      <StudioTopbar projectName={projectName} setProjectName={setProjectName} savedAt={savedAt} navigate={navigate} product={product} albumReady={albumReady} filledSlots={filledSlots} totalSlots={totalSlots} onPreview={() => setPreviewOpen(true)} onDownloadPdf={handleDownloadPdf} onSaveAndCheckout={handleSaveAndCheckout} onRandomFill={randomFillAllSpreads} onRestartDesign={restartDesignFromScratch} hasPhotos={photoBin.some((photo) => photo.src && !photo.uploading && !photo.uploadError)} exportingPdf={exportingPdf} savingDesign={savingDesign} saveError={saveError} />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "72px 280px 1fr 320px", overflow: "hidden", minHeight: 0 }}>
        {/* Tool rail */}
        <StudioRail active={activeTool} setActive={setActiveTool} />

        {/* Left panel */}
        <StudioLeftPanel tool={activeTool} photoBin={photoBin} spreads={spreads} activeSpread={activeSpread} setActiveSpread={setActiveSpread} onPickPhoto={(photo) => placePhoto(photo)} onAddSpread={handleAddSpread} onUploadClick={() => uploadInputRef.current?.click()} selectedText={selectedText} onAddText={addTextItem} onUpdateText={(patch) => selectedText && updateTextItem(selectedText.id, patch)} onRemoveText={() => selectedText && removeTextItem(selectedText.id)} backgroundColor={activeBackgroundColor} onUpdateBackground={updateActiveBackground} />

        {/* Canvas */}
        <StudioCanvas spread={activeSpreadData} zoom={zoom} setZoom={setZoom} activeIndex={activeSpread} totalSpreads={spreads.length} setActiveSpread={setActiveSpread} selectedItemId={selectedItemId} setSelectedItemId={(itemId) => { setSelectedItemForSpread(activeSpread, itemId); setSelectedTextForSpread(activeSpread, null); }} selectedTextId={selectedTextId} setSelectedTextId={selectTextItem} onPlacePhoto={placePhoto} onUpdateItem={updateItem} onRemoveImageSection={removeImageSection} onUpdateTextItem={updateTextItem} onDeleteTextItem={removeTextItem} onBeginTransform={saveHistorySnapshot} />

        {/* Right panel */}
        <StudioRightPanel layout={activeLayout} setLayout={applyLayout} aspectFilter={aspectFilter} setAspectFilter={setAspectFilter} selectedItem={selectedItem} onUpdateItem={updateItem} onAddImageSection={addImageSection} onRemoveImageSection={() => selectedItem && removeImageSection(selectedItem.id)} onRemoveImage={() => selectedItem && updateItem(selectedItem.id, clearPhotoPatch())} onAutofill={autofillRemaining} albumReady={albumReady} filledSlots={filledSlots} totalSlots={totalSlots} hasPhotos={photoBin.length > 0} />
      </div>
      <input ref={uploadInputRef} type="file" accept="image/*,.heic,.heif,.tif,.tiff" multiple onChange={handleUploadLibrary} style={{ display: "none" }} />

      {/* Bottom: page filmstrip */}
      <StudioFilmstrip spreads={spreads} active={activeSpread} setActive={setActiveSpread} onAddSpread={handleAddSpread} />
      {previewOpen && <AlbumPreviewOverlay spreads={spreads} projectName={projectName} onClose={() => setPreviewOpen(false)} />}
      </div>
    </StudioComponentContext.Provider>
  );
}

function StudioTopbar({ projectName, setProjectName, savedAt, navigate, product, albumReady, filledSlots, totalSlots, onPreview, onDownloadPdf, onSaveAndCheckout, onRandomFill, onRestartDesign, hasPhotos, exportingPdf, savingDesign, saveError }) {
  const { Logo } = useStudioComponents();
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--ink)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={() => navigate("home")} style={{ height: 18, color: "var(--bg)" }}>
          <Logo color="var(--bg)" />
        </button>
        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }}></span>
        <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ background: "transparent", color: "var(--paper)", border: 0, fontFamily: "inherit", fontSize: 14, width: 280, outline: "none", padding: "6px 10px", borderRadius: 6 }} />
        <span style={{ fontSize: 11, color: "rgba(244,239,230,0.45)" }}>Page 4 of 60</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12, color: "rgba(244,239,230,0.55)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="dot-pulse" style={{ background: "var(--ok)", width: 6, height: 6 }}></span>
            Saved · {savedAt}
          </span>
        </div>
        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }}></span>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="icon-btn" style={{ color: "rgba(244,239,230,0.7)" }} title="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button className="icon-btn" style={{ color: "rgba(244,239,230,0.7)" }} title="Redo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
          </button>
          <button className="icon-btn" style={{ color: "rgba(244,239,230,0.7)" }} title="History">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
        </div>
        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }}></span>
        <button className="btn btn-sm" onClick={onPreview} style={{ color: "var(--paper)", border: "1px solid rgba(255,255,255,0.2)" }}>
          Preview
        </button>
        <button className="btn btn-sm" onClick={onRandomFill} disabled={!hasPhotos} title={hasPhotos ? "Randomly fill every image layer" : "Upload photos before random filling"} style={{ color: "var(--paper)", border: "1px solid rgba(255,255,255,0.2)", opacity: hasPhotos ? 1 : 0.45, cursor: hasPhotos ? "pointer" : "default" }}>
          Random fill
        </button>
        <button className="btn btn-sm" onClick={onRestartDesign} title="Remove all design edits and start again" style={{ color: "var(--paper)", border: "1px solid rgba(255,255,255,0.2)" }}>
          Restart
        </button>
        {saveError && (
          <span title={saveError} style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--rust)", fontSize: 12 }}>
            {saveError}
          </span>
        )}
        {albumReady ? (
          <button className="btn btn-accent btn-sm" onClick={onDownloadPdf} disabled={exportingPdf}>
            {exportingPdf ? "Preparing PDF..." : "Download PDF"}
          </button>
        ) : (
          <button className="btn btn-sm" style={{ color: "rgba(244,239,230,0.65)", border: "1px solid rgba(255,255,255,0.16)", cursor: "default" }}>
            Fill pages · {filledSlots}/{totalSlots}
          </button>
        )}
        <button
          className="btn btn-accent btn-sm"
          onClick={onSaveAndCheckout}
          disabled={!albumReady || savingDesign}
          title={albumReady ? "Save album design to cart" : "Fill every image frame before saving"}
          style={{ opacity: albumReady && !savingDesign ? 1 : 0.45, cursor: albumReady && !savingDesign ? "pointer" : "default" }}
        >
          {savingDesign ? "Saving design PDF..." : albumReady ? `Save & Checkout · $${product.price}` : `Fill pages · ${filledSlots}/${totalSlots}`}
        </button>
      </div>
    </div>
  );
}

function AlbumPreviewOverlay({ spreads, projectName, onClose }) {
  const pageSpreads = spreads.filter((spread) => !isCoverLayout(spread.layout));
  const coverSpread = spreads.find((spread) => spread.layout === "cover") || spreads[0];
  const backCoverSpread = spreads.find((spread) => spread.layout === "back-cover");
  const [previewIndex, setPreviewIndex] = useState(-1);
  const [turning, setTurning] = useState(null);
  const backCoverIndex = pageSpreads.length;
  const currentSpread = previewIndex >= 0 && previewIndex < backCoverIndex ? pageSpreads[previewIndex] : null;
  const canGoBack = previewIndex > -1;
  const canGoNext = previewIndex < (backCoverSpread ? backCoverIndex : pageSpreads.length - 1);

  const turnTo = (nextIndex) => {
    const maxIndex = backCoverSpread ? backCoverIndex : pageSpreads.length - 1;
    if (nextIndex < -1 || nextIndex > maxIndex || turning) return;
    setTurning(nextIndex > previewIndex ? "next" : "prev");
    window.setTimeout(() => {
      setPreviewIndex(nextIndex);
      setTurning(null);
    }, 280);
  };

  const handleBookClick = (event) => {
    if (turning) return;
    if (previewIndex < 0) {
      turnTo(0);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const clickedRightPage = event.clientX - rect.left > rect.width / 2;
    if (clickedRightPage && canGoNext) turnTo(previewIndex + 1);
    if (!clickedRightPage && canGoBack) turnTo(previewIndex - 1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") turnTo(Math.min(backCoverSpread ? backCoverIndex : pageSpreads.length - 1, previewIndex + 1));
      if (event.key === "ArrowLeft") turnTo(Math.max(-1, previewIndex - 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, pageSpreads.length, previewIndex, turning]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "radial-gradient(circle at 50% 20%, rgba(82,72,58,0.94), rgba(18,15,12,0.98) 58%)", display: "flex", flexDirection: "column", color: "var(--paper)" }}>
      <div style={{ height: 66, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(244,239,230,0.52)", textTransform: "uppercase", letterSpacing: 0.08 }}>Album preview</div>
          <div style={{ fontSize: 15, color: "var(--paper)" }}>{projectName}</div>
        </div>
        <button className="icon-btn" onClick={onClose} title="Close preview" style={{ width: 38, height: 38, color: "var(--paper)", background: "rgba(255,255,255,0.08)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "88px minmax(320px, 1fr) 88px", alignItems: "center", gap: 18, padding: "28px 22px 34px", perspective: 1800 }}>
        <button className="icon-btn" onClick={() => turnTo(previewIndex - 1)} disabled={!canGoBack || turning} title="Previous page" style={{ justifySelf: "center", width: 54, height: 54, color: canGoBack ? "var(--paper)" : "rgba(244,239,230,0.22)", background: "rgba(255,255,255,0.07)", cursor: canGoBack ? "pointer" : "default" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div onClick={handleBookClick} style={{ justifySelf: "center", width: "min(78vw, 920px)", transformStyle: "preserve-3d", cursor: previewIndex < 0 || canGoBack || canGoNext ? "pointer" : "default" }}>
          {previewIndex < 0 ? (
            <PreviewCover projectName={projectName} coverSpread={coverSpread} />
          ) : previewIndex === backCoverIndex && backCoverSpread ? (
            <PreviewCover projectName={projectName} coverSpread={backCoverSpread} label="Back cover" />
          ) : (
            <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
              <PreviewBookSpread spread={currentSpread} />
              <div title="Previous page" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", zIndex: 12, cursor: canGoBack ? "w-resize" : "default" }}></div>
              <div title="Next page" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", zIndex: 12, cursor: canGoNext ? "e-resize" : "default" }}></div>
              {turning && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "50%",
                    right: turning === "next" ? 0 : "auto",
                    left: turning === "prev" ? 0 : "auto",
                    transformOrigin: turning === "next" ? "left center" : "right center",
                    animation: `${turning === "next" ? "safarnamaPageTurnNext" : "safarnamaPageTurnPrev"} 280ms ease-in-out both`,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.16), rgba(244,239,230,0.92) 44%, rgba(48,39,31,0.22))",
                    boxShadow: "0 20px 38px rgba(0,0,0,0.28)",
                    borderRadius: turning === "next" ? "0 8px 8px 0" : "8px 0 0 8px",
                    pointerEvents: "none",
                    zIndex: 14,
                  }}
                />
              )}
            </div>
          )}
          <style>{`
            @keyframes safarnamaPageTurnNext {
              from { transform: rotateY(0deg); opacity: 0.98; }
              to { transform: rotateY(-74deg); opacity: 0.42; }
            }
            @keyframes safarnamaPageTurnPrev {
              from { transform: rotateY(0deg); opacity: 0.98; }
              to { transform: rotateY(74deg); opacity: 0.42; }
            }
          `}</style>
        </div>

        <button className="icon-btn" onClick={() => turnTo(previewIndex + 1)} disabled={!canGoNext || turning} title={previewIndex < 0 ? "Open cover" : "Next page"} style={{ justifySelf: "center", width: 54, height: 54, color: canGoNext ? "var(--paper)" : "rgba(244,239,230,0.22)", background: "rgba(255,255,255,0.07)", cursor: canGoNext ? "pointer" : "default" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(244,239,230,0.58)", fontSize: 12 }}>
        <span>{previewIndex < 0 ? "Cover" : previewIndex === backCoverIndex && backCoverSpread ? "Back cover" : `${previewIndex + 1} / ${pageSpreads.length}`}</span>
        <span style={{ width: 46, height: 1, background: "rgba(255,255,255,0.16)" }}></span>
        <span>{previewIndex < 0 ? "Open the album to review the pages" : previewIndex === backCoverIndex && backCoverSpread ? "Final cover" : currentSpread?.title}</span>
      </div>
    </div>
  );
}

function PreviewCover({ projectName, coverSpread, label = "Safarnama Album" }) {
  const hasCustomCoverText = (coverSpread?.textItems || []).length > 0;
  return (
    <div style={{ width: "min(58vh, 430px)", aspectRatio: "1", margin: "0 auto", position: "relative", transform: "rotateX(4deg) rotateY(-14deg)", transformStyle: "preserve-3d", filter: "drop-shadow(0 34px 46px rgba(0,0,0,0.48))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 12, overflow: "hidden", background: coverSpread?.backgroundColor || "#2E211B", boxShadow: "inset 18px 0 22px rgba(0,0,0,0.34), inset -1px 0 0 rgba(255,255,255,0.1)" }}>
        <PreviewSpreadArtwork spread={coverSpread} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.50), rgba(255,255,255,0.04) 34%, rgba(0,0,0,0.18) 100%)" }}></div>
        <div style={{ position: "absolute", left: 26, top: 0, bottom: 0, width: 16, background: "linear-gradient(90deg, rgba(0,0,0,0.42), rgba(255,255,255,0.08), rgba(0,0,0,0.22))" }}></div>
        <div style={{ position: "absolute", inset: 34, border: "1px solid rgba(244,239,230,0.38)", borderRadius: 7 }}></div>
        {!hasCustomCoverText && (
          <div style={{ position: "absolute", left: 58, right: 44, bottom: 54 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.18, color: "rgba(244,239,230,0.64)", marginBottom: 12 }}>{label}</div>
            <div style={{ fontSize: 32, lineHeight: 1.08, color: "var(--paper)", fontFamily: "Georgia, serif" }}>{projectName}</div>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: -14, top: 10, bottom: 10, width: 16, borderRadius: "8px 0 0 8px", background: "linear-gradient(90deg, #1B120E, #6A4A36)", transform: "translateZ(-8px)" }}></div>
    </div>
  );
}

function PreviewBookSpread({ spread }) {
  return (
    <div style={{ position: "relative", aspectRatio: "2 / 1", borderRadius: 8, background: "#EFE7D8", boxShadow: "0 34px 70px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(255,255,255,0.28)", overflow: "hidden", transform: "rotateX(3deg)", transformStyle: "preserve-3d" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.10), transparent 7%, transparent 43%, rgba(0,0,0,0.16) 50%, transparent 57%, transparent 94%, rgba(0,0,0,0.12))", pointerEvents: "none", zIndex: 6 }}></div>
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 8, transform: "translateX(-50%)", background: "linear-gradient(90deg, rgba(0,0,0,0.16), rgba(255,255,255,0.26), rgba(0,0,0,0.16))", zIndex: 7 }}></div>
      <PreviewSpreadArtwork spread={spread} />
      <div style={{ position: "absolute", left: 8, right: 8, bottom: -10, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.34)", filter: "blur(10px)", zIndex: -1 }}></div>
    </div>
  );
}

function PreviewSpreadArtwork({ spread }) {
  const { SmartImage } = useStudioComponents();
  const bg = spread?.backgroundColor || DEFAULT_SPREAD_BACKGROUND;
  const isCover = isCoverLayout(spread?.layout);
  return (
    <div style={{ position: "absolute", inset: 0, background: bg }}>
      {!isCover && <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.06)", zIndex: 3 }}></div>}
      {(spread?.items || []).map((item) => (
        <div key={item.id} style={{ position: "absolute", left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, overflow: "hidden", borderRadius: 3, background: "#E4DBC9", boxShadow: "0 0 0 1px rgba(0,0,0,0.04)" }}>
          {item.src ? <SmartImage src={item.src} className="img-fill" style={{ objectPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%` }} /> : null}
        </div>
      ))}
      {(spread?.textItems || []).map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.w}%`,
            height: `${item.h}%`,
            color: item.color,
            background: item.background,
            padding: item.padding,
            borderRadius: item.borderRadius,
            fontFamily: item.fontFamily,
            fontSize: item.fontSize,
            fontWeight: item.fontWeight,
            fontStyle: item.fontStyle,
            textDecoration: item.textDecoration,
            textAlign: item.textAlign,
            lineHeight: item.lineHeight,
            letterSpacing: item.letterSpacing,
            textTransform: item.textTransform,
            opacity: item.opacity / 100,
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            zIndex: 4,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

function StudioRail({ active, setActive }) {
  const tools = [
    { id: "pages", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, label: "Pages" },
    { id: "photos", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>, label: "Photos" },
    { id: "layouts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>, label: "Layouts" },
    { id: "text", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>, label: "Text" },
    { id: "background", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>, label: "Background" },
    { id: "settings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, label: "Settings" },
    { id: "info", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>, label: "Info" },
  ];
  return (
    <div style={{ background: "var(--ink-2)", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", padding: "16px 0", gap: 4 }}>
      {tools.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} title={t.label}
          style={{
            margin: "0 12px", padding: "12px 0", borderRadius: 10,
            background: active === t.id ? "rgba(154,107,63,0.18)" : "transparent",
            color: active === t.id ? "var(--accent-2)" : "rgba(244,239,230,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", cursor: "pointer"
          }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}

function StudioLeftPanel({ tool, photoBin, spreads, activeSpread, setActiveSpread, onPickPhoto, onAddSpread, onUploadClick, selectedText, onAddText, onUpdateText, onRemoveText, backgroundColor, onUpdateBackground }) {
  if (tool === "pages") {
    return (
      <div style={{ background: "var(--ink-2)", borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 14 }}>Pages · {spreads.length}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {spreads.map((s, i) => (
            <button key={i} onClick={() => setActiveSpread(i)} style={{ padding: 0, borderRadius: 6, overflow: "hidden", border: i === activeSpread ? "2px solid var(--accent)" : "1px solid rgba(255,255,255,0.08)", background: "var(--paper)", aspectRatio: isCoverLayout(s.layout) ? "1" : "1.4/1", position: "relative", cursor: "pointer" }}>
              <MiniSpread spread={s} />
              <span style={{ position: "absolute", bottom: 2, right: 4, fontSize: 9, color: "var(--muted)", background: "rgba(255,255,255,0.85)", padding: "1px 4px", borderRadius: 3 }}>{i+1}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-sm" onClick={onAddSpread} style={{ marginTop: 16, width: "100%", background: "rgba(255,255,255,0.06)", color: "var(--paper)" }}>+ Add spread</button>
      </div>
    );
  }
  if (tool === "photos") {
    return (
      <div style={{ background: "var(--ink-2)", borderRight: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", padding: 18, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase" }}>Photos · {photoBin.length}</div>
          <button onClick={onUploadClick} style={{ fontSize: 11, color: "var(--accent-2)" }}>+ Upload</button>
        </div>
        <input className="input" placeholder="Search photos..." style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--paper)", marginBottom: 12, fontSize: 12, padding: "10px 12px" }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <span className="tag" style={{ background: "rgba(154,107,63,0.2)", color: "var(--accent-2)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 10 }}>Library photos</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }}>
          {photoBin.length === 0 && (
            <div style={{ border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 8, padding: "24px 16px", textAlign: "center", background: "rgba(255,255,255,0.03)", color: "rgba(244,239,230,0.7)" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(154,107,63,0.18)", color: "var(--accent-2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              </div>
              <div style={{ fontSize: 13, color: "var(--paper)", marginBottom: 6 }}>Select images for this album</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>Add photos to the library, then click or drag them into the page frames.</div>
              <button className="btn btn-accent btn-sm" onClick={onUploadClick} style={{ width: "100%" }}>Choose images</button>
            </div>
          )}
          {photoBin.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {photoBin.map((photo) => (
                <button
                  key={photo.id}
                  draggable
                  onClick={() => onPickPhoto(photo)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("application/safarnama-photo", JSON.stringify(photoPatch(photo)));
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  title={`Place ${photo.name}`}
                  style={{ aspectRatio: "1", borderRadius: 4, overflow: "hidden", cursor: "grab", position: "relative", border: "1px solid rgba(255,255,255,0.08)", padding: 0, background: "transparent" }}
                >
                  <SmartImage src={photo.src} alt={photo.name} className="img-fill" />
                  {photo.uploading && (
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.42)", color: "var(--paper)", fontSize: 10 }}>
                      Uploading
                    </span>
                  )}
                  {photo.uploadError && (
                    <span title={photo.uploadError} style={{ position: "absolute", right: 4, bottom: 4, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(122,42,42,0.92)", color: "white", fontSize: 10 }}>
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (tool === "text") {
    return (
      <div style={{ background: "var(--ink-2)", borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 14 }}>Text editor</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, marginBottom: 18 }}>
          <button className="btn btn-sm" onClick={() => onAddText("heading")} style={{ width: "100%", background: "rgba(154,107,63,0.16)", color: "var(--accent-2)" }}>Add heading</button>
          <button className="btn btn-sm" onClick={() => onAddText("body")} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "var(--paper)" }}>Add body text</button>
          <button className="btn btn-sm" onClick={() => onAddText("caption")} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "var(--paper)" }}>Add caption</button>
        </div>

        {!selectedText && (
          <div style={{ border: "1px dashed rgba(255,255,255,0.16)", borderRadius: 8, padding: 16, color: "rgba(244,239,230,0.62)", fontSize: 12, lineHeight: 1.5 }}>
            Select a text box on the spread or add a new text layer to edit its typography and layout.
          </div>
        )}

        {selectedText && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 8 }}>Content</span>
              <textarea
                value={selectedText.text}
                onChange={(event) => onUpdateText({ text: event.target.value })}
                rows={5}
                style={{ width: "100%", resize: "vertical", minHeight: 96, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "var(--paper)", padding: 10, fontFamily: "inherit", fontSize: 12, lineHeight: 1.45, outline: "none" }}
              />
            </label>

            <TextSelect label="Font" value={selectedText.fontFamily} onChange={(fontFamily) => onUpdateText({ fontFamily })} options={[
              ["var(--font)", "Safarnama Sans"],
              ["Georgia, serif", "Serif"],
              ["Times New Roman, serif", "Classic"],
              ["Helvetica, Arial, sans-serif", "Helvetica"],
              ["ui-monospace, SFMono-Regular, Menlo, monospace", "Mono"],
            ]} />

            <StudioRange label="Size" value={selectedText.fontSize} min={8} max={72} onChange={(fontSize) => onUpdateText({ fontSize })} />
            <StudioRange label="Weight" value={selectedText.fontWeight} min={100} max={900} step={100} onChange={(fontWeight) => onUpdateText({ fontWeight })} />
            <StudioRange label="Line" value={Math.round(selectedText.lineHeight * 100)} min={80} max={220} onChange={(lineHeight) => onUpdateText({ lineHeight: lineHeight / 100 })} />
            <StudioRange label="Track" value={selectedText.letterSpacing} min={0} max={12} onChange={(letterSpacing) => onUpdateText({ letterSpacing })} />
            <StudioRange label="Opacity" value={selectedText.opacity} min={10} max={100} onChange={(opacity) => onUpdateText({ opacity })} />

            <TextSegment label="Style" value={selectedText.fontStyle} onChange={(fontStyle) => onUpdateText({ fontStyle })} options={[["normal", "Regular"], ["italic", "Italic"]]} />
            <TextSegment label="Decoration" value={selectedText.textDecoration} onChange={(textDecoration) => onUpdateText({ textDecoration })} options={[["none", "None"], ["underline", "Underline"]]} />
            <TextSegment label="Case" value={selectedText.textTransform} onChange={(textTransform) => onUpdateText({ textTransform })} options={[["none", "Aa"], ["uppercase", "AA"], ["lowercase", "aa"]]} />
            <TextSegment label="Align" value={selectedText.textAlign} onChange={(textAlign) => onUpdateText({ textAlign })} options={[["left", "Left"], ["center", "Center"], ["right", "Right"]]} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <TextColor label="Text" value={selectedText.color} onChange={(color) => onUpdateText({ color })} />
              <TextColor label="Fill" value={selectedText.background === "transparent" ? "#FBF8F2" : selectedText.background} onChange={(background) => onUpdateText({ background })} />
            </div>
            <button className="btn btn-sm" onClick={() => onUpdateText({ background: "transparent" })} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "rgba(244,239,230,0.75)" }}>Clear fill</button>

            <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 8 }}>Frame</div>
              <StudioRange label="X" value={selectedText.x} min={0} max={100 - selectedText.w} onChange={(x) => onUpdateText({ x })} />
              <StudioRange label="Y" value={selectedText.y} min={0} max={100 - selectedText.h} onChange={(y) => onUpdateText({ y })} />
              <StudioRange label="Width" value={selectedText.w} min={8} max={100 - selectedText.x} onChange={(w) => onUpdateText({ w })} />
              <StudioRange label="Height" value={selectedText.h} min={6} max={100 - selectedText.y} onChange={(h) => onUpdateText({ h })} />
              <StudioRange label="Pad" value={selectedText.padding} min={0} max={24} onChange={(padding) => onUpdateText({ padding })} />
              <StudioRange label="Radius" value={selectedText.borderRadius} min={0} max={24} onChange={(borderRadius) => onUpdateText({ borderRadius })} />
            </div>

            <button className="btn btn-sm" onClick={onRemoveText} style={{ width: "100%", background: "rgba(184,90,40,0.16)", color: "#DFA17B" }}>Delete text layer</button>
          </div>
        )}
      </div>
    );
  }
  if (tool === "background") {
    return (
      <div style={{ background: "var(--ink-2)", borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 14 }}>Page background</div>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 14, background: "rgba(255,255,255,0.03)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(244,239,230,0.62)" }}>Current page</span>
            <span style={{ width: 34, height: 24, borderRadius: 5, border: "1px solid rgba(255,255,255,0.18)", background: backgroundColor }}></span>
          </div>
          <div style={{ fontSize: 13, color: "var(--paper)" }}>{backgroundColor.toUpperCase()}</div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>Swatches</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 }}>
          {BACKGROUND_SWATCHES.map((color) => (
            <button
              key={color}
              onClick={() => onUpdateBackground(color)}
              title={color}
              style={{ height: 44, borderRadius: 7, border: backgroundColor === color ? "2px solid var(--accent-2)" : "1px solid rgba(255,255,255,0.14)", background: color, boxShadow: backgroundColor === color ? "0 0 0 3px rgba(154,107,63,0.14)" : "none" }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>Custom color</div>
        <label style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 12, background: "rgba(255,255,255,0.03)", marginBottom: 18, cursor: "pointer" }}>
          <input type="color" value={backgroundColor} onChange={(event) => onUpdateBackground(event.target.value)} style={{ width: 48, height: 36, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: 2, background: "rgba(255,255,255,0.06)", cursor: "pointer" }} />
          <div>
            <div style={{ fontSize: 12, color: "var(--paper)", marginBottom: 3 }}>Choose any background color</div>
            <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)" }}>{backgroundColor.toUpperCase()}</div>
          </div>
        </label>
        <button className="btn btn-sm" onClick={() => onUpdateBackground(DEFAULT_SPREAD_BACKGROUND)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "var(--paper)" }}>Reset page background</button>
        <div style={{ marginTop: 14, fontSize: 12, color: "rgba(244,239,230,0.58)", lineHeight: 1.5 }}>
          Background color is saved per spread. Other pages keep their own background until you change them.
        </div>
      </div>
    );
  }
  // default = layouts list
  return (
    <div style={{ background: "var(--ink-2)", borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", padding: 18 }}>
      <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 14 }}>{tool} options</div>
      <div style={{ fontSize: 13, color: "rgba(244,239,230,0.7)", lineHeight: 1.6 }}>Select an item from the rail to configure it. Tap an element on the canvas to inspect it.</div>
    </div>
  );
}

function StudioCanvas({ spread, zoom, setZoom, activeIndex, totalSpreads, setActiveSpread, selectedItemId, setSelectedItemId, selectedTextId, setSelectedTextId, onPlacePhoto, onUpdateItem, onRemoveImageSection, onUpdateTextItem, onDeleteTextItem, onBeginTransform }) {
  const bg = spread.backgroundColor || DEFAULT_SPREAD_BACKGROUND;
  const isCover = isCoverLayout(spread.layout);
  const canvasWidth = isCover ? 360 : 720;
  const spreadRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const handleMove = (event) => {
      const drag = dragRef.current;
      if (!drag || !spreadRef.current) return;
      const rect = spreadRef.current.getBoundingClientRect();
      const dx = ((event.clientX - drag.startX) / rect.width) * 100;
      const dy = ((event.clientY - drag.startY) / rect.height) * 100;
      if (!drag.historySaved && (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
        onBeginTransform();
        dragRef.current = { ...drag, historySaved: true };
      }
      const update = drag.kind === "text" ? onUpdateTextItem : onUpdateItem;
      if (drag.mode === "crop") {
        const frameWidth = drag.frameRect?.width || rect.width;
        const frameHeight = drag.frameRect?.height || rect.height;
        update(drag.item.id, {
          focalX: clampStudioValue((drag.item.focalX ?? 50) - (((event.clientX - drag.startX) / frameWidth) * 100), 0, 100),
          focalY: clampStudioValue((drag.item.focalY ?? 50) - (((event.clientY - drag.startY) / frameHeight) * 100), 0, 100),
        }, { trackHistory: false });
      } else if (drag.mode === "resize") {
        update(drag.item.id, {
          w: clampStudioValue(drag.item.w + dx, 8, 100 - drag.item.x),
          h: clampStudioValue(drag.item.h + dy, drag.kind === "text" ? 6 : 8, 100 - drag.item.y),
        }, { trackHistory: false });
      } else {
        update(drag.item.id, {
          x: clampStudioValue(drag.item.x + dx, 0, 100 - drag.item.w),
          y: clampStudioValue(drag.item.y + dy, 0, 100 - drag.item.h),
        }, { trackHistory: false });
      }
    };
    const handleUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [onBeginTransform, onUpdateItem, onUpdateTextItem]);

  const handleCanvasDrop = (event) => {
    event.preventDefault();
    if (!spreadRef.current) return;
    const payload = event.dataTransfer.getData("application/safarnama-photo");
    if (!payload) return;
    const photo = JSON.parse(payload);
    const rect = spreadRef.current.getBoundingClientRect();
    onPlacePhoto(photo, null, {
      x: clampStudioValue(((event.clientX - rect.left) / rect.width) * 100 - 14, 0, 72),
      y: clampStudioValue(((event.clientY - rect.top) / rect.height) * 100 - 16, 0, 68),
    });
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #1F1C19 0%, #15120F 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, overflow: "hidden" }}>
      {/* Prev/Next */}
      <button className="icon-btn" onClick={() => setActiveSpread(Math.max(0, activeIndex - 1))} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(244,239,230,0.45)", width: 44, height: 44, background: "rgba(255,255,255,0.04)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button className="icon-btn" onClick={() => setActiveSpread(Math.min(totalSpreads - 1, activeIndex + 1))} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(244,239,230,0.45)", width: 44, height: 44, background: "rgba(255,255,255,0.04)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Spread */}
      <div style={{ transform: `scale(${zoom/100})`, transformOrigin: "center", transition: "transform 0.2s" }}>
        <div ref={spreadRef} onDrop={handleCanvasDrop} onDragOver={(event) => event.preventDefault()} style={{ display: "flex", boxShadow: "0 30px 80px -10px rgba(0,0,0,0.5)", position: "relative", width: canvasWidth, height: 360, background: bg, borderRadius: isCover ? 8 : 0, overflow: "hidden" }}>
          {isCover ? (
            <CoverPageSurface spread={spread} />
          ) : (
            <>
              <div style={{ width: 360, aspectRatio: "1", background: bg, position: "relative", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
                <SpreadPage spread={spread} side="left" />
              </div>
              <div style={{ width: 360, aspectRatio: "1", background: bg, position: "relative" }}>
                <SpreadPage spread={spread} side="right" />
              </div>
            </>
          )}
          {(spread.items || []).map((item) => (
            <PhotoFrame
              key={item.id}
              item={item}
              selected={selectedItemId === item.id}
              onSelect={() => setSelectedItemId(item.id)}
              onPlacePhoto={onPlacePhoto}
              onDelete={() => onRemoveImageSection(item.id)}
              onStartDrag={(event, mode, frameRect) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedItemId(item.id);
                event.currentTarget.setPointerCapture?.(event.pointerId);
                dragRef.current = { kind: "photo", mode, item, frameRect, startX: event.clientX, startY: event.clientY, historySaved: false };
              }}
            />
          ))}
          {(spread.textItems || []).map((item) => (
            <TextFrame
              key={item.id}
              item={item}
              selected={selectedTextId === item.id}
              onSelect={() => setSelectedTextId(item.id)}
              onDelete={() => onDeleteTextItem(item.id)}
              onStartDrag={(event, mode) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedTextId(item.id);
                event.currentTarget.setPointerCapture?.(event.pointerId);
                dragRef.current = { kind: "text", mode, item, startX: event.clientX, startY: event.clientY, historySaved: false };
              }}
            />
          ))}
        </div>
      </div>

      {/* Zoom */}
      <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.4)", padding: "6px 12px", borderRadius: "var(--r-pill)", fontSize: 12, color: "rgba(244,239,230,0.8)" }}>
        <button onClick={() => setZoom(Math.max(40, zoom - 10))}>−</button>
        <span style={{ minWidth: 36, textAlign: "center" }}>{zoom}%</span>
        <button onClick={() => setZoom(Math.min(180, zoom + 10))}>+</button>
        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }}></span>
        <button onClick={() => setZoom(100)}>Fit</button>
      </div>

      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "rgba(244,239,230,0.5)" }}>
        <span>{spread.title}</span>
        <span>·</span>
        <span>{activeIndex + 1} / {totalSpreads}</span>
      </div>
    </div>
  );
}

function SpreadPage({ spread, side }) {
  if (isCoverLayout(spread.layout)) {
    return null;
  }
  if (spread.layout !== "blank") return null;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 11 }}>Drop a photo here</div>
  );
}

function CoverPageSurface({ spread }) {
  const bg = spread.backgroundColor || "#2E211B";
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.28), rgba(255,255,255,0.04) 32%, rgba(0,0,0,0.14) 100%)" }}></div>
      <div style={{ position: "absolute", left: 24, top: 0, bottom: 0, width: 14, background: "linear-gradient(90deg, rgba(0,0,0,0.36), rgba(255,255,255,0.08), rgba(0,0,0,0.18))" }}></div>
      <div style={{ position: "absolute", inset: 24, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6 }}></div>
    </div>
  );
}

function PhotoFrame({ item, selected, onSelect, onPlacePhoto, onDelete, onStartDrag }) {
  const { SmartImage } = useStudioComponents();
  const frameRef = useRef(null);
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = event.dataTransfer.getData("application/safarnama-photo");
    if (!payload) return;
    const photo = JSON.parse(payload);
    onPlacePhoto(photo, item.id);
  };
  return (
    <div
      ref={frameRef}
      onPointerDown={(event) => onStartDrag(event, "move")}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      style={{
        position: "absolute",
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.w}%`,
        height: `${item.h}%`,
        borderRadius: 4,
        overflow: "hidden",
        background: "var(--bg-3)",
        cursor: "move",
        boxShadow: selected ? "0 0 0 2px var(--accent), 0 0 0 5px rgba(154,107,63,0.22)" : "0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: selected ? 3 : 2,
      }}
    >
      {item.src ? (
        <SmartImage src={item.src} className="img-fill" style={{ objectPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%` }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 11, background: "repeating-linear-gradient(45deg, #E4DBC9, #E4DBC9 8px, #ECE5D7 8px, #ECE5D7 16px)" }}>
          Drop photo
        </div>
      )}
      {selected && (
        <>
          <button
            title="Remove image section"
            onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); onDelete(); }}
            style={{ position: "absolute", right: 4, top: 4, width: 22, height: 22, borderRadius: 4, background: "rgba(184,90,40,0.95)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {item.src && (
            <button
              title="Reposition image"
              onPointerDown={(event) => onStartDrag(event, "crop", frameRef.current?.getBoundingClientRect())}
              style={{ position: "absolute", left: 4, top: 4, width: 22, height: 22, borderRadius: 4, background: "rgba(0,0,0,0.58)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M5 9l-3 3 3 3"/><path d="M19 9l3 3-3 3"/><path d="M9 5l3-3 3 3"/><path d="M9 19l3 3 3-3"/></svg>
            </button>
          )}
          <button
            title="Resize"
            onPointerDown={(event) => onStartDrag(event, "resize")}
            style={{ position: "absolute", right: 4, bottom: 4, width: 18, height: 18, borderRadius: 4, background: "var(--accent)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "nwse-resize", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          </button>
        </>
      )}
    </div>
  );
}

function TextFrame({ item, selected, onSelect, onDelete, onStartDrag }) {
  return (
    <div
      onPointerDown={(event) => onStartDrag(event, "move")}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      style={{
        position: "absolute",
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.w}%`,
        height: `${item.h}%`,
        cursor: "move",
        zIndex: selected ? 5 : 4,
        boxShadow: selected ? "0 0 0 1.5px var(--accent), 0 0 0 4px rgba(154,107,63,0.18)" : "none",
        borderRadius: item.borderRadius,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          color: item.color,
          background: item.background,
          padding: item.padding,
          borderRadius: item.borderRadius,
          fontFamily: item.fontFamily,
          fontSize: item.fontSize,
          fontWeight: item.fontWeight,
          fontStyle: item.fontStyle,
          textDecoration: item.textDecoration,
          textAlign: item.textAlign,
          lineHeight: item.lineHeight,
          letterSpacing: item.letterSpacing,
          textTransform: item.textTransform,
          opacity: item.opacity / 100,
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {item.text}
      </div>
      {selected && (
        <>
          <button
            title="Delete text"
            onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); onDelete(); }}
            style={{ position: "absolute", right: 4, top: 4, width: 18, height: 18, borderRadius: 4, background: "rgba(184,90,40,0.95)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button
            title="Resize text"
            onPointerDown={(event) => onStartDrag(event, "resize")}
            style={{ position: "absolute", right: 4, bottom: 4, width: 18, height: 18, borderRadius: 4, background: "var(--accent)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "nwse-resize", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          </button>
        </>
      )}
    </div>
  );
}

function MiniSpread({ spread }) {
  const { SmartImage } = useStudioComponents();
  const items = spread.items || [];
  const textItems = spread.textItems || [];
  const bg = spread.backgroundColor || DEFAULT_SPREAD_BACKGROUND;
  return (
    <div style={{ display: "flex", height: "100%", position: "relative", overflow: "hidden", background: bg }}>
      {isCoverLayout(spread.layout) ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.20), transparent 36%, rgba(0,0,0,0.10))" }}></div>
          <div style={{ position: "absolute", left: "8%", top: 0, bottom: 0, width: "4%", background: "rgba(0,0,0,0.18)" }}></div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, position: "relative", borderRight: "0.5px solid rgba(0,0,0,0.05)", background: bg }}>
          </div>
          <div style={{ flex: 1, position: "relative", background: bg }}>
          </div>
        </>
      )}
      {items.slice(0, 6).map((item) => (
        <div key={item.id} style={{ position: "absolute", left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, overflow: "hidden", borderRadius: 1 }}>
          {item.src ? <SmartImage src={item.src} className="img-fill" style={{ objectPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%` }} /> : <div style={{ width: "100%", height: "100%", background: "#E4DBC9" }} />}
        </div>
      ))}
      {textItems.slice(0, 4).map((item) => (
        <div key={item.id} style={{ position: "absolute", left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, color: item.color, fontSize: Math.max(3, item.fontSize / 7), fontWeight: item.fontWeight, textAlign: item.textAlign, lineHeight: 1.1, overflow: "hidden", opacity: item.opacity / 100 }}>
          {item.text}
        </div>
      ))}
    </div>
  );
}

function StudioRightPanel({ layout, setLayout, aspectFilter, setAspectFilter, selectedItem, onUpdateItem, onAddImageSection, onRemoveImageSection, onRemoveImage, onAutofill, albumReady, filledSlots, totalSlots, hasPhotos }) {
  const aspects = ["4:3", "3:2", "1:1", "Pano"];
  const layouts = {
    "4:3": [
      { id: "cover", name: "Cover" },
      { id: "back-cover", name: "Back cover" },
      { id: "title", name: "Photo right" },
      { id: "full-bleed", name: "Full bleed" },
      { id: "1+1", name: "1 + 1" },
      { id: "1+text", name: "Photo left" },
      { id: "2+2", name: "2 + 2" },
      { id: "3+1", name: "3 + 1" },
      { id: "grid", name: "Grid 4" },
      { id: "centered", name: "Centered" },
    ],
  };
  return (
    <div style={{ background: "var(--ink-2)", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--paper)" }}>Layout</div>
        <select className="select" style={{ width: "auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--paper)", fontSize: 12, padding: "6px 10px" }}>
          <option>All spreads</option>
          <option>Title spread</option>
          <option>Photo spread</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 18, padding: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
        {aspects.map(a => (
          <button key={a} onClick={() => setAspectFilter(a)} style={{ flex: 1, padding: "6px 0", fontSize: 11, borderRadius: 5, background: aspectFilter === a ? "rgba(154,107,63,0.25)" : "transparent", color: aspectFilter === a ? "var(--accent-2)" : "rgba(244,239,230,0.6)" }}>
            {a}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {(layouts[aspectFilter] || layouts["4:3"]).map(l => (
          <button key={l.id} onClick={() => setLayout(l.id)} style={{ padding: 0, borderRadius: 6, border: layout === l.id ? "1.5px solid var(--accent)" : "1px solid rgba(255,255,255,0.08)", background: layout === l.id ? "rgba(154,107,63,0.1)" : "rgba(255,255,255,0.03)", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ aspectRatio: "1.6/1", background: "var(--paper)", padding: 6 }}>
              <LayoutPreview type={l.id} />
            </div>
            <div style={{ fontSize: 10, color: layout === l.id ? "var(--accent-2)" : "rgba(244,239,230,0.55)", padding: "6px 8px", textAlign: "left" }}>{l.name}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>Spread settings</div>
        <SettingRow label="Margin" value="Standard" />
        <SettingRow label="Spacing" value="6 mm" />
        <SettingRow label="Caption" value="Below image" />
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>Image sections</div>
        <button className="btn btn-sm" onClick={onAddImageSection} style={{ width: "100%", background: "rgba(154,107,63,0.15)", color: "var(--accent-2)" }}>
          Add image section
        </button>
      </div>

      {selectedItem && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>Selected photo</div>
          <StudioRange label="X" value={selectedItem.x} min={0} max={100 - selectedItem.w} onChange={(x) => onUpdateItem(selectedItem.id, { x })} />
          <StudioRange label="Y" value={selectedItem.y} min={0} max={100 - selectedItem.h} onChange={(y) => onUpdateItem(selectedItem.id, { y })} />
          <StudioRange label="Width" value={selectedItem.w} min={8} max={100 - selectedItem.x} onChange={(w) => onUpdateItem(selectedItem.id, { w })} />
          <StudioRange label="Height" value={selectedItem.h} min={8} max={100 - selectedItem.y} onChange={(h) => onUpdateItem(selectedItem.id, { h })} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 10 }}>Image position</div>
            <StudioRange label="Horizontal" value={selectedItem.focalX ?? 50} min={0} max={100} onChange={(focalX) => onUpdateItem(selectedItem.id, { focalX })} />
            <StudioRange label="Vertical" value={selectedItem.focalY ?? 50} min={0} max={100} onChange={(focalY) => onUpdateItem(selectedItem.id, { focalY })} />
            <button className="btn btn-sm" onClick={() => onUpdateItem(selectedItem.id, { focalX: 50, focalY: 50 })} style={{ width: "100%", marginTop: 8, background: "rgba(255,255,255,0.06)", color: "rgba(244,239,230,0.76)" }}>
              Center image
            </button>
          </div>
          <button className="btn btn-sm" onClick={onRemoveImage} style={{ width: "100%", marginTop: 10, background: "rgba(255,255,255,0.06)", color: "rgba(244,239,230,0.82)" }}>
            Remove image
          </button>
          <button className="btn btn-sm" onClick={onRemoveImageSection} style={{ width: "100%", marginTop: 8, background: "rgba(184,90,40,0.16)", color: "#DFA17B" }}>
            Remove image section
          </button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-sm" onClick={onAutofill} disabled={!hasPhotos} style={{ width: "100%", background: hasPhotos ? "rgba(154,107,63,0.15)" : "rgba(255,255,255,0.05)", color: hasPhotos ? "var(--accent-2)" : "rgba(244,239,230,0.35)", cursor: hasPhotos ? "pointer" : "default" }}>
          Auto-fill this spread
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: albumReady ? "var(--accent-2)" : "rgba(244,239,230,0.5)", textAlign: "center" }}>
          {albumReady ? "Album ready for PDF export" : hasPhotos ? `${filledSlots}/${totalSlots} image frames filled` : "Upload images to begin filling pages"}
        </div>
      </div>
    </div>
  );
}

function StudioRange({ label, value, min, max, step = 1, onChange }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "56px 1fr 34px", alignItems: "center", gap: 8, padding: "7px 0", fontSize: 12, color: "rgba(244,239,230,0.6)" }}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={Math.round(value)} onChange={(event) => onChange(Number(event.target.value))} />
      <span style={{ color: "var(--paper)", textAlign: "right" }}>{Math.round(value)}</span>
    </label>
  );
}

function TextSelect({ label, value, options, onChange }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 7 }}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "var(--paper)", padding: "9px 10px", fontSize: 12, outline: "none" }}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function TextSegment({ label, value, options, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "rgba(244,239,230,0.5)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 7 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 4, padding: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
        {options.map(([optionValue, optionLabel]) => (
          <button key={optionValue} onClick={() => onChange(optionValue)} style={{ padding: "7px 4px", borderRadius: 5, background: value === optionValue ? "rgba(154,107,63,0.25)" : "transparent", color: value === optionValue ? "var(--accent-2)" : "rgba(244,239,230,0.62)", fontSize: 11 }}>
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextColor({ label, value, onChange }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "1fr 34px", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(244,239,230,0.62)" }}>
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} style={{ width: 34, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: 2, background: "rgba(255,255,255,0.06)" }} />
    </label>
  );
}

function SettingRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12 }}>
      <span style={{ color: "rgba(244,239,230,0.55)" }}>{label}</span>
      <span style={{ color: "var(--paper)" }}>{value}</span>
    </div>
  );
}

function LayoutPreview({ type }) {
  const cell = { background: "#D9D1C0", borderRadius: 1.5 };
  const styles = {
    "cover": [{ left: "16%", top: "16%", width: "68%", height: "42%" }],
    "back-cover": [{ left: "16%", top: "16%", width: "68%", height: "42%" }],
    "title": [{ right: "10%", top: "20%", width: "30%", height: "60%" }],
    "full-bleed": [{ inset: 0 }],
    "1+1": [{ left: "8%", top: "12%", width: "38%", height: "76%" }, { right: "8%", top: "12%", width: "38%", height: "76%" }],
    "1+text": [{ left: "8%", top: "12%", width: "38%", height: "76%" }],
    "2+2": [{ left: "8%", top: "8%", width: "38%", height: "38%" }, { left: "8%", bottom: "8%", width: "38%", height: "38%" }, { right: "8%", top: "8%", width: "38%", height: "38%" }, { right: "8%", bottom: "8%", width: "38%", height: "38%" }],
    "3+1": [{ left: "8%", top: "8%", width: "38%", height: "38%" }, { left: "8%", bottom: "8%", width: "18%", height: "38%" }, { left: "29%", bottom: "8%", width: "17%", height: "38%" }, { right: "8%", top: "8%", width: "38%", height: "84%" }],
    "grid": [{ left: "8%", top: "12%", width: "38%", height: "32%" }, { right: "8%", top: "12%", width: "38%", height: "32%" }, { left: "8%", bottom: "12%", width: "38%", height: "32%" }, { right: "8%", bottom: "12%", width: "38%", height: "32%" }],
    "centered": [{ left: "20%", top: "20%", width: "60%", height: "60%" }],
  };
  const items = styles[type] || styles["full-bleed"];
  const isCover = isCoverLayout(type);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#FBF8F2" }}>
      {isCover && <div style={{ position: "absolute", left: "9%", top: 0, bottom: 0, width: "4%", background: "rgba(0,0,0,0.10)" }}></div>}
      {!isCover && <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.04)" }}></div>}
      {items.map((s, i) => <div key={i} style={{ position: "absolute", ...cell, ...s }} />)}
    </div>
  );
}

function StudioFilmstrip({ spreads, active, setActive, onAddSpread }) {
  return (
    <div style={{ background: "var(--ink-2)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 6, overflowX: "auto", height: 110 }}>
      {spreads.map((s, i) => (
        <button key={i} onClick={() => setActive(i)} style={{ flexShrink: 0, height: 76, aspectRatio: isCoverLayout(s.layout) ? "1" : "1.4/1", padding: 0, borderRadius: 4, overflow: "hidden", border: i === active ? "2px solid var(--accent)" : "1px solid rgba(255,255,255,0.08)", background: "var(--paper)", cursor: "pointer", position: "relative" }}>
          <MiniSpread spread={s} />
          <div style={{ position: "absolute", bottom: 2, left: 4, fontSize: 9, color: "rgba(0,0,0,0.55)", background: "rgba(255,255,255,0.85)", padding: "1px 4px", borderRadius: 3, letterSpacing: 0.04 }}>{i+1}</div>
        </button>
      ))}
      <button onClick={onAddSpread} style={{ flexShrink: 0, height: 76, aspectRatio: "1.4/1", borderRadius: 4, border: "1px dashed rgba(255,255,255,0.18)", color: "rgba(244,239,230,0.5)", fontSize: 11, background: "transparent", cursor: "pointer" }}>+ Spread</button>
    </div>
  );
}
