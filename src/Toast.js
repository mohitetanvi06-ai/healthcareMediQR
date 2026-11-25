import React, { useEffect } from "react";

/**
 * Toast Component for MedQRate
 * Props:
 *   message: string
 *   type: "success" | "error" | "info" | "warning"
 *   onClose: function
 *   duration: number (default: 4000ms)
 */
export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  };

  const borders = {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#0284C7"
  };

  const backgrounds = {
    success: "#ECFDF5",
    error: "#FEF2F2",
    warning: "#FFFBEB",
    info: "#EFF6FF"
  };

  const textColors = {
    success: "#065F46",
    error: "#991B1B",
    warning: "#92400E",
    info: "#075985"
  };

  return (
    <div style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 99999,
      minWidth: 320,
      maxWidth: 420,
      background: backgrounds[type] || "#FFFFFF",
      border: `1.5px solid ${borders[type] || "#CBD5E1"}`,
      borderLeft: `6px solid ${borders[type] || "#0D9488"}`,
      borderRadius: 12,
      padding: "14px 18px",
      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icons[type]}</span>
        <div style={{ fontSize: 14, fontWeight: 600, color: textColors[type] || "#0F172A", lineHeight: 1.4 }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 14,
          color: textColors[type] || "#64748B",
          cursor: "pointer",
          padding: 4,
          lineHeight: 1,
          fontWeight: 700
        }}
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
