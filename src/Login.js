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
      setError("❌ Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <>
      <style>
        {`
          .login-wrapper {
            min-height: 90vh;
            background-image: linear-gradient(rgba(10, 5, 25, 0.9), rgba(20, 10, 45, 0.9)), url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .login-card {
            width: 100%;
            max-width: 440px;
            background: rgba(30, 20, 50, 0.55);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.08);
            padding: clamp(20px, 5vw, 40px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            animation: fadeIn 0.6s ease-in-out;
            color: white;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .page-title {
            font-weight: 900;
            background: linear-gradient(135deg, #d8b4fe, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
            font-size: clamp(20px, 5vw, 28px);
            letter-spacing: -0.5px;
          }

          .form-control {
            border-radius: 12px;
            padding: 13px 16px;
            border: 1.5px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            color: white !important;
            transition: all 0.3s;
            font-size: 15px;
          }

          .form-control::placeholder {
            color: rgba(255,255,255,0.45);
          }

          .form-control:focus {
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
            border-color: #a855f7;
            background: rgba(255,255,255,0.08);
            outline: none;
          }

          .login-btn {
            background: linear-gradient(135deg, #a855f7, #3b82f6);
            border: none;
            border-radius: 50px;
            padding: 13px;
            font-weight: 700;
            font-size: 16px;
            color: white;
            width: 100%;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(168,85,247,0.3);
          }

          .login-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(168,85,247,0.5);
            opacity: 1;
          }
          
          .login-btn:disabled {
            opacity: 0.6;
          }

          .register-link {
            color: #d8b4fe;
            cursor: pointer;
            font-weight: 700;
            text-decoration: underline;
          }

          .navbar {
            padding: 14px 28px !important;
            background: rgba(20, 10, 45, 0.7) !important;
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .navbar h3 { font-size: clamp(18px, 4vw, 24px); letter-spacing: -0.5px; }
        `}
      </style>
       
       {/* ================= NAVBAR (Dark Purple) ================= */}
      <nav
        className="navbar navbar-expand-lg px-5 py-3"
      >
        <div className="d-flex align-items-center">
  <img
    src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg"
    alt="MedQRate Logo"
    width="45" 
    height="45"
    className="me-2"
    style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}
  />
        <h3 className="fw-bold text-white mb-0">MedQRate</h3>
       </div>
        <div className="ms-auto">
          <button
            className="btn px-4 rounded-pill fw-semibold"
            style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", color: "white", border: "none", boxShadow: "0 4px 12px rgba(168,85,247,0.3)" }}
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </nav>
      

      <div className="login-wrapper">
        <div className="login-card">

          <h2 className="text-center page-title">
            🔐 Welcome Back
          </h2>

          {error && (
            <div style={{ background:"#fff0f0", border:"1.5px solid #ffcccc", color:"#cc0000", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email Address"
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control mb-4"
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button className="login-btn w-100" disabled={loading}>
              {loading ? "⏳ Logging in..." : "Login"}
            </button>

          </form>

          <p className="text-center mt-3">
            Don't have an account?{" "}
            <span
              className="register-link"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>

        </div>
      </div>
    </>
  );
}

export default Login;