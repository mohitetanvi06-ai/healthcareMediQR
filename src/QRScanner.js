import React, { useEffect, useRef, useState } from "react";

/**
 * QRScanner — Camera scan + Image file upload scan
 * Props:
 *   onScanSuccess(decodedText)
 *   onClose()
 */
function QRScanner({ onScanSuccess, onClose }) {
  const html5QrRef  = useRef(null);
  const [mode, setMode]     = useState("choose");   // choose | camera | file
  const [error, setError]   = useState(null);
  const [status, setStatus] = useState("idle");     // idle | starting | scanning
  const [fileLoading, setFileLoading] = useState(false);

  // ── Stop camera cleanly ──
  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      try { await html5QrRef.current.clear(); } catch {}
      html5QrRef.current = null;
    }
    setStatus("idle");
  };

  // ── Start camera scanner ──
  const startCamera = async () => {
    setMode("camera");
    setError(null);
    setStatus("starting");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-cam-container");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => { stopCamera(); onScanSuccess(decoded); },
        () => {}
      );
      setStatus("scanning");
    } catch {
      setError("Camera permission denied. Please allow camera permissions or upload an image file instead.");
      setStatus("idle");
    }
  };

  // ── Scan from uploaded image file ──
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileLoading(true);
    setError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-file-reader");
      const result  = await scanner.scanFile(file, true);
      try { await scanner.clear(); } catch {}
      setFileLoading(false);
      onScanSuccess(result);
    } catch {
      setFileLoading(false);
      setError("Unable to read QR code from this image. Please provide a clear, well-lit photo.");
    }
  };

  // Cleanup on unmount
  useEffect(() => () => { stopCamera(); }, []);

  const handleClose = async () => { await stopCamera(); onClose(); };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>📷</span>
            <h5 style={{ margin: 0, color: "#0F172A", fontWeight: 700, fontSize: 18 }}>Scan Prescription QR</h5>
          </div>
          <button onClick={handleClose} style={S.closeBtn} title="Close">✕</button>
        </div>

        {/* CHOOSE MODE */}
        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "#64748B", fontSize: 13.5, marginBottom: 8 }}>
              Select how you would like to import the prescription QR code:
            </p>

            <button style={S.optBtn("teal")} onClick={startCamera}>
              <span style={{ fontSize: 28 }}>📹</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Use Device Camera</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Scan directly using your phone or webcam</div>
              </div>
            </button>

            <button style={S.optBtn("blue")} onClick={() => { setMode("file"); setError(null); }}>
              <span style={{ fontSize: 28 }}>🖼️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Upload QR Image File</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Select PNG or JPG prescription image</div>
              </div>
            </button>

            <button onClick={handleClose} style={S.cancelBtn}>Cancel</button>
          </div>
        )}

        {/* CAMERA MODE */}
        {mode === "camera" && (
          <div>
            {status === "starting" && (
              <div style={S.centerBox}>
                <div className="spinner-border text-teal" style={{ color: "#0D9488" }} />
                <p style={{ marginTop: 12, color: "#64748B", fontSize: 13.5 }}>Initializing camera stream...</p>
              </div>
            )}
            <div id="qr-cam-container" style={{ width: "100%", borderRadius: 12, overflow: "hidden", background: "#0F172A", minHeight: status === "scanning" ? 280 : 0 }} />
            {status === "scanning" && (
              <p style={{ textAlign: "center", color: "#0D9488", fontWeight: 600, marginTop: 12, fontSize: 13.5 }}>
                📡 Center the QR code inside the frame...
              </p>
            )}
            {error && <div style={S.errorBox}>{error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => { stopCamera(); setMode("choose"); }} style={{ ...S.cancelBtn, flex: 1 }}>← Back to Options</button>
              <button onClick={handleClose} style={{ ...S.cancelBtn, flex: 1 }}>Close</button>
            </div>
          </div>
        )}

        {/* FILE MODE */}
        {mode === "file" && (
          <div>
            {/* Hidden scanner div required by html5-qrcode */}
            <div id="qr-file-reader" style={{ display: "none" }} />

            <div style={S.uploadZone}>
              <span style={{ fontSize: 44 }}>🖼️</span>
              <p style={{ fontWeight: 700, color: "#0F766E", margin: "10px 0 4px", fontSize: 15 }}>
                Upload QR Code Image
              </p>
              <p style={{ fontSize: 12.5, color: "#64748B", marginBottom: 16 }}>
                Select the QR file your doctor provided (PNG, JPG, JPEG)
              </p>
              <label style={S.uploadLabel}>
                {fileLoading ? "Reading QR..." : "📂 Select Image File"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={fileLoading}
                />
              </label>
            </div>

            {error && <div style={S.errorBox}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => { setMode("choose"); setError(null); }} style={{ ...S.cancelBtn, flex: 1 }}>← Back</button>
              <button onClick={handleClose} style={{ ...S.cancelBtn, flex: 1 }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──
const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: 20,
    backdropFilter: "blur(3px)",
  },
  modal: {
    background: "#FFFFFF",
    borderRadius: 20,
    padding: 26,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.2)",
    border: "1px solid #E2E8F0",
  },
  closeBtn: {
    background: "#F1F5F9",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    fontSize: 14,
    color: "#64748B",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s ease",
  },
  optBtn: (variant) => ({
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: variant === "teal"
      ? "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)"
      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
    color: "white",
    border: "none",
    borderRadius: 14,
    padding: "16px 18px",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: variant === "teal"
      ? "0 4px 12px rgba(13, 148, 136, 0.2)"
      : "0 4px 12px rgba(2, 132, 199, 0.2)",
    transition: "transform 0.2s ease, opacity 0.2s ease",
  }),
  cancelBtn: {
    width: "100%",
    padding: "10px",
    background: "#F8FAFC",
    border: "1px solid #CBD5E1",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13.5,
    color: "#475569",
    marginTop: 6,
  },
  centerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 0",
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FEE2E2",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#991B1B",
    marginTop: 12,
    fontSize: 13,
  },
  uploadZone: {
    border: "2px dashed #99F6E4",
    borderRadius: 14,
    padding: "26px 18px",
    textAlign: "center",
    background: "#F0FDFA",
  },
  uploadLabel: {
    background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "9px 22px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13.5,
    display: "inline-block",
    boxShadow: "0 2px 6px rgba(13, 148, 136, 0.25)",
  },
};

export default QRScanner;
