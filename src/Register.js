import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || "PATIENT";

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    dob: "", age: "", speciality: "",
    qualification: "", address: "", phone: "", role: initialRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData((prev) => ({ ...prev, role: newRole }));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, formData);
      alert("Registration successful! Please sign in with your credentials.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Registration failed. Please try again.";
      setError(typeof msg === "string" ? msg : "Registration failed. Email may already be registered.");
    } finally {
      setLoading(false);
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
        .btn-login-top {
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
        .btn-login-top:hover {
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
          max-width: 520px;
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
          margin-bottom: 20px;
        }

        /* Role Switcher */
        .role-switch-container {
          display: flex;
          background: #F1F5F9;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 22px;
          gap: 4px;
        }
        .role-btn {
          flex: 1;
          border: none;
          padding: 10px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748B;
          background: transparent;
        }
        .role-btn.active {
          background: #FFFFFF;
          color: #0D9488;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          font-weight: 700;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 5px;
          display: block;
        }
        .auth-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          font-size: 14px;
          color: #0F172A;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          margin-bottom: 14px;
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
          margin-top: 10px;
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
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="auth-navbar">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <div className="logo-icon-badge">🩺</div>
          <h3>Med<span>QRate</span></h3>
        </div>
        <button className="btn-login-top" onClick={() => navigate("/login")}>
          Already registered? <strong>Sign In</strong>
        </button>
      </nav>

      {/* ── REGISTER FORM CARD ── */}
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-sub">Select your account type and fill in your details</p>

          {/* Role Switcher */}
          <div className="role-switch-container">
            <button
              type="button"
              className={`role-btn ${role === "PATIENT" ? "active" : ""}`}
              onClick={() => handleRoleChange("PATIENT")}
            >
              👤 Patient Account
            </button>
            <button
              type="button"
              className={`role-btn ${role === "DOCTOR" ? "active" : ""}`}
              onClick={() => handleRoleChange("DOCTOR")}
            >
              🩺 Doctor Account
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                className="auth-input"
                name="name"
                placeholder={role === "DOCTOR" ? "Dr. John Doe" : "Jane Smith"}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {role === "PATIENT" ? (
              <div className="row g-2">
                <div className="col-sm-6">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="auth-input"
                    name="dob"
                    type="date"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Age</label>
                  <input
                    className="auth-input"
                    type="number"
                    name="age"
                    placeholder="e.g. 28"
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="row g-2">
                <div className="col-sm-6">
                  <label className="form-label">Speciality</label>
                  <input
                    className="auth-input"
                    name="speciality"
                    placeholder="e.g. Cardiologist"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Qualification</label>
                  <input
                    className="auth-input"
                    name="qualification"
                    placeholder="e.g. MBBS, MD"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label">Address / City</label>
                <input
                  className="auth-input"
                  name="address"
                  placeholder="e.g. Pune, MH"
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Phone Number</label>
                <input
                  className="auth-input"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{ fontSize: "14px", color: "#64748B" }}>
            Already have an account?{" "}
            <span
              style={{ color: "#0D9488", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/login")}
            >
              Sign In here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
