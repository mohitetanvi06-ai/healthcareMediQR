import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Toast from "./Toast";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    try {
      const res = await axios.post(`${API}/auth/login`, { email: cleanEmail, password: cleanPassword });
      localStorage.setItem("user", JSON.stringify(res.data));
      setToast({ message: `Welcome back, ${res.data.name}! Signing in...`, type: "success" });
      setTimeout(() => {
        if (res.data.role === "PATIENT") {
          navigate("/patient-home");
        } else {
          navigate("/doctor-home");
        }
      }, 900);
    } catch (err) {
      const msg = err.response?.data?.message || (err.message === "Network Error" ? "Backend server unreachable. Please verify server connection." : "Invalid email or password. Please verify your credentials.");
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === "doctor") {
      setEmail("doctor@medqrate.com");
      setPassword("password123");
    } else {
      setEmail("patient@medqrate.com");
      setPassword("password123");
    }
    setToast({ message: `Autofilled ${role} credentials!`, type: "info" });
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        .auth-navbar {
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          cursor: pointer;
        }
        .logo-icon-badge {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        .auth-logo h3 {
          color: #0F172A;
          font-weight: 800;
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.03em;
        }
        .btn-back-nav {
          background: #F8FAFC;
          color: #475569;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 7px 14px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-back-nav:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #94A3B8;
        }

        .auth-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          background: radial-gradient(circle at 50% 10%, #F0FDFA 0%, #F8FAFC 70%);
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
          animation: fadeUp 0.35s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
          display: block;
        }
        .auth-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          font-size: 14.5px;
          color: #0F172A;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          margin-bottom: 18px;
        }
        .auth-input:focus {
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
        }
        .btn-auth-submit {
          width: 100%;
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
          margin-top: 4px;
        }
        .btn-auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(13, 148, 136, 0.35);
        }
        .quick-fill-box {
          background: #F8FAFC;
          border: 1px dashed #CBD5E1;
          border-radius: 10px;
          padding: 12px;
          margin-top: 20px;
          font-size: 12.5px;
          color: #475569;
        }
        .quick-fill-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #0F766E;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .quick-fill-btn:hover {
          background: #F0FDFA;
          border-color: #99F6E4;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="auth-navbar">
        <div className="d-flex align-items-center gap-3">
          <button className="btn-back-nav" onClick={() => navigate("/")} title="Go back to Home">
            ← Back to Home
          </button>
          <div className="auth-logo" onClick={() => navigate("/")}>
            <div className="logo-icon-badge">🩺</div>
            <h3 className="d-none d-sm-block">Med<span style={{ color: "#0D9488" }}>QRate</span></h3>
          </div>
        </div>

        <button
          className="btn-back-nav"
          onClick={() => navigate("/register")}
          style={{ background: "#F1F5F9", color: "#0D9488", fontWeight: 700 }}
        >
          Register
        </button>
      </nav>

      {/* ── LOGIN FORM CARD ── */}
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span style={{ fontSize: "22px" }}>🔐</span>
            <h2 className="fw-bold mb-0" style={{ fontSize: "24px", color: "#0F172A" }}>Sign In</h2>
          </div>
          <p className="text-muted mb-4" style={{ fontSize: "14px" }}>Enter your credentials to access your clinical dashboard</p>

          {error && (
            <div className="p-3 mb-3 rounded-2 text-danger" style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", fontSize: "13.5px" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="doctor@medqrate.com or patient@medqrate.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="quick-fill-box">
            <div className="fw-semibold mb-2 text-slate-700">⚡ Demo Quick Fill:</div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="quick-fill-btn"
                onClick={() => handleQuickFill("doctor")}
              >
                🩺 Doctor Demo
              </button>
              <button
                type="button"
                className="quick-fill-btn"
                onClick={() => handleQuickFill("patient")}
              >
                👤 Patient Demo
              </button>
            </div>
          </div>

          <p className="text-center mt-4 mb-0" style={{ fontSize: "14px", color: "#64748B" }}>
            Don't have an account?{" "}
            <span
              style={{ color: "#0D9488", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/register")}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
