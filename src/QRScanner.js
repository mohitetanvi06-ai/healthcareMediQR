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
      setError("Camera access denied. Please allow camera permissions and try again.");
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
      setError("Could not read QR code from this image. Please try a clearer photo.");
    }
  };

  // Cleanup on unmount
  useEffect(() => () => { stopCamera(); }, []);

  const handleClose = async () => { await stopCamera(); onClose(); };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h5 style={{ margin:0, color:"#d8b4fe", fontWeight:800, fontSize: "18px" }}>📷 Scan Prescription QR</h5>
          <button onClick={handleClose} style={S.closeBtn}>✕</button>
        </div>

        {/* CHOOSE MODE */}
        {mode === "choose" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <p style={{ color:"#ccc", fontSize:14, textAlign:"center", marginBottom:4 }}>
              How would you like to scan the QR code?
            </p>

            <button style={S.optBtn("#a855f7")} onClick={startCamera}>
              <span style={{ fontSize:30 }}>📷</span>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Use Camera</div>
                <div style={{ fontSize:12, opacity:0.8 }}>Scan live using your phone or webcam</div>
              </div>
            </button>

            <button style={S.optBtn("#3b82f6")} onClick={() => { setMode("file"); setError(null); }}>
              <span style={{ fontSize:30 }}>🖼️</span>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Upload QR Image</div>
                <div style={{ fontSize:12, opacity:0.8 }}>Select the QR image sent by your doctor</div>
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
                <div className="spinner-border text-light" role="status" />
                <p style={{ marginTop:12, color:"#ccc" }}>Starting camera...</p>
              </div>
            )}
            <div id="qr-cam-container" style={{ width:"100%", borderRadius:14, overflow:"hidden", background:"#000", minHeight: status === "scanning" ? 280 : 0 }} />
            {status === "scanning" && (
              <p style={{ textAlign:"center", color:"#d8b4fe", fontWeight:600, marginTop:12 }}>
                📡 Point camera at QR code...
              </p>
            )}
            {error && <div style={S.errorBox}>{error}</div>}
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <button onClick={() => { stopCamera(); setMode("choose"); }} style={{ ...S.cancelBtn, flex:1 }}>← Back</button>
              <button onClick={handleClose} style={{ ...S.cancelBtn, flex:1 }}>Close</button>
            </div>
          </div>
        )}

        {/* FILE MODE */}
        {mode === "file" && (
          <div>
            {/* Hidden scanner div required by html5-qrcode */}
            <div id="qr-file-reader" style={{ display:"none" }} />

            <div style={S.uploadZone}>
              <span style={{ fontSize:48 }}>🖼️</span>
              <p style={{ fontWeight:700, color:"#3b82f6", margin:"10px 0 4px" }}>Upload QR Code Image</p>
              <p style={{ fontSize:13, color:"#ccc", marginBottom:16 }}>
                Select the QR image your doctor sent you (PNG/JPG)
              </p>
              <label style={S.uploadLabel}>
                {fileLoading ? "⏳ Reading QR..." : "📂 Choose Image"}
                <input type="file" accept="image/*" onChange={handleFileUpload}
                  style={{ display:"none" }} disabled={fileLoading} />
              </label>
            </div>

            {error && <div style={S.errorBox}>{error}</div>}

            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <button onClick={() => { setMode("choose"); setError(null); }} style={{ ...S.cancelBtn, flex:1 }}>← Back</button>
              <button onClick={handleClose} style={{ ...S.cancelBtn, flex:1 }}>Close</button>
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
    position:"fixed", inset:0, background:"rgba(10, 5, 25, 0.8)",
    backdropFilter: "blur(6px)",
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:10000, padding:20,
  },
  modal: {
    background:"rgba(30, 20, 50, 0.95)",
    backdropFilter:"blur(20px)",
    borderRadius:22, padding:26,
    width:"100%", maxWidth:420,
    boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "white",
  },
  closeBtn: {
    background:"rgba(255,255,255,0.08)", border:"none", borderRadius:"50%",
    width:34, height:34, fontSize:16, cursor:"pointer", color: "white",
    display:"flex", alignItems:"center", justifyContent:"center",
    transition: "background 0.2s",
  },
  optBtn: (color) => ({
    display:"flex", alignItems:"center", gap:16,
    background:`linear-gradient(135deg, ${color}, ${color}cc)`,
    color:"white", border:"none", borderRadius:16,
    padding:"16px 20px", cursor:"pointer", textAlign:"left",
    boxShadow:`0 4px 16px ${color}44`, transition:"all 0.3s ease",
  }),
  cancelBtn: {
    width:"100%", padding:"11px", background:"rgba(255,255,255,0.06)",
    color: "white", border:"none", borderRadius:50, fontWeight:600, cursor:"pointer", fontSize:14,
    transition: "background 0.2s",
  },
  centerBox: {
    display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 0",
  },
  errorBox: {
    background:"rgba(255,85,85,0.1)", border:"1px solid #ff5555", borderRadius:12,
    padding:"12px 16px", color:"#ff8888", marginTop:12, fontSize:13,
  },
  uploadZone: {
    border:"2px dashed rgba(168, 85, 247, 0.4)", borderRadius:16, padding:"30px 20px",
    textAlign:"center", background:"rgba(255,255,255,0.02)",
  },
  uploadLabel: {
    background:"linear-gradient(135deg,#3b82f6,#818cf8)", color:"white",
    border:"none", borderRadius:50, padding:"11px 28px",
    fontWeight:700, cursor:"pointer", fontSize:14, display:"inline-block",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },
};

export default QRScanner;
