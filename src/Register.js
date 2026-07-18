import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "PATIENT";

  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    dob: "", age: "", speciality: "",
    qualification: "", address: "", phone: "", role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, formData);
      alert("✅ Registered Successfully! Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Registration failed. Please try again.";
      setError(typeof msg === "string" ? msg : "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .reg-wrapper {
          min-height: 89vh;
          background-image: linear-gradient(rgba(10, 5, 25, 0.9), rgba(20, 10, 45, 0.9)), url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .reg-card {
          width: 100%;
          max-width: 480px;
          background: rgba(30, 20, 50, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: clamp(20px, 5vw, 36px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: fadeUp 0.6s ease;
          color: white;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .reg-title { font-weight:900; background: linear-gradient(135deg, #d8b4fe, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size:clamp(18px,5vw,24px); margin-bottom:18px; text-align:center; letter-spacing: -0.5px; }
        .reg-input {
          width:100%; border-radius:12px; padding:12px 16px;
          border:1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white !important; font-size:15px;
          transition:0.3s; margin-bottom:12px; outline:none; box-sizing:border-box;
        }
        .reg-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .reg-input:focus { border-color:#a855f7; box-shadow:0 0 10px rgba(168,85,247,0.3); background: rgba(255,255,255,0.08); }
        .reg-btn {
          width:100%; background:linear-gradient(135deg,#a855f7,#3b82f6);
          border:none; border-radius:50px; padding:13px;
          font-weight:700; font-size:16px; color:white;
          cursor:pointer; transition:0.3s; margin-top:4px;
          box-shadow: 0 4px 15px rgba(168,85,247,0.3);
        }
        .reg-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 6px 20px rgba(168,85,247,0.5); opacity:1; }
        .reg-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .reg-navbar {
          background: rgba(20, 10, 45, 0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .reg-navbar img { width:42px; height:42px; border-radius:10px; object-fit:cover; border: 1px solid rgba(255,255,255,0.1); }
        .reg-navbar h3 { color:white; font-weight:900; margin:0; font-size:clamp(18px,4vw,24px); letter-spacing: -0.5px; }
        .reg-navbar button { background:linear-gradient(135deg, #a855f7, #3b82f6); color:white; border:none; border-radius:50px; padding:8px 22px; font-weight:700; font-size:13px; cursor:pointer; box-shadow: 0 4px 12px rgba(168,85,247,0.3); }
        .error-box { background:rgba(255,240,240,0.1); border:1.5px solid #ff5555; color:#ff8888; border-radius:12px; padding:10px 14px; margin-bottom:12px; font-size:14px; }
        .divider { display:flex; align-items:center; gap:10px; margin:12px 0; }
        .divider hr { flex:1; border-color:#eee; }
        .divider span { color:#999; font-size:13px; white-space:nowrap; }
        .login-link { text-align:center; margin-top:14px; font-size:14px; color: #ccc; }
        .login-link span { color:#d8b4fe; font-weight:700; cursor:pointer; text-decoration:underline; }
      `}</style>

      {/* NAVBAR */}
      <nav className="reg-navbar">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg" alt="logo" />
          <h3>MedQRate</h3>
        </div>
        <button onClick={() => navigate("/login")}>Login</button>
      </nav>

      <div className="reg-wrapper">
        <div className="reg-card">
          <p className="reg-title">
            {role === "DOCTOR" ? "🩺 Doctor Registration" : "👤 Patient Registration"}
          </p>

          {error && <div className="error-box">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <input className="reg-input" name="name" placeholder="Full Name" onChange={handleChange} required />
            <input className="reg-input" type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
            <input className="reg-input" type="password" name="password" placeholder="Password (min 6 chars)" onChange={handleChange} required minLength={6} />

            {role === "PATIENT" ? (
              <>
                <input className="reg-input" name="dob" type="date" placeholder="Date of Birth" onChange={handleChange} />
                <input className="reg-input" type="number" name="age" placeholder="Age" onChange={handleChange} />
              </>
            ) : (
              <>
                <input className="reg-input" name="speciality" placeholder="Speciality (e.g. Cardiologist)" onChange={handleChange} />
                <input className="reg-input" name="qualification" placeholder="Qualification (e.g. MBBS, MD)" onChange={handleChange} />
              </>
            )}

            <input className="reg-input" name="address" placeholder="Address" onChange={handleChange} />
            <input className="reg-input" name="phone" placeholder="Phone Number" onChange={handleChange} />

            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? "⏳ Registering..." : "✅ Register Now"}
            </button>
          </form>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;