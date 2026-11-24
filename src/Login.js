import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      if (res.data.role === "PATIENT") {
        navigate("/patient-home");
      } else {
        navigate("/doctor-home");
      }
    } catch (err) {
      setError("Invalid email or password. Please verify your credentials.");
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
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
        .auth-logo span {
          color: #0D9488;
        }
        .btn-register-top {
          background: #F1F5F9;
          color: #334155;
          border: 1px solid #CBD5E1;
          border-radius: 10px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-register-top:hover {
          background: #E2E8F0;
          color: #0F172A;
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
        .auth-title {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 6px;
        }
        .auth-sub {
          color: #64748B;
          font-size: 14px;
          margin-bottom: 24px;
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
        .btn-auth-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .error-banner {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          color: #991B1B;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13.5px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
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
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #0F766E;
          cursor: pointer;
          margin-left: 6px;
          transition: background 0.15s ease;
        }
        .quick-fill-btn:hover {
          background: #F0FDFA;
          border-color: #99F6E4;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="auth-navbar">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <div className="logo-icon-badge">🩺</div>
          <h3>Med<span>QRate</span></h3>
        </div>
        <button className="btn-register-top" onClick={() => navigate("/register")}>
          Need an account? <strong>Register</strong>
        </button>
      </nav>

      {/* ── LOGIN FORM CARD ── */}
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span style={{ fontSize: "20px" }}>🔐</span>
            <h2 className="auth-title mb-0">Sign In to MedQRate</h2>
          </div>
          <p className="auth-sub">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <div>{error}</div>
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

          {/* Quick Demo Credentials for evaluators */}
          <div className="quick-fill-box">
            <div className="fw-semibold mb-1 text-slate-700">⚡ Demo Autofill:</div>
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
