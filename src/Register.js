import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Toast from "./Toast";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const SPECIALITIES = [
  "General Physician / Internal Medicine",
  "Cardiologist (Heart Specialist)",
  "Dermatologist (Skin & Hair)",
  "Pediatrician (Child Specialist)",
  "Orthopedic Surgeon (Bone & Joint)",
  "Gynecologist & Obstetrician (Women's Health)",
  "Neurologist (Brain & Nerve)",
  "ENT Specialist (Ear, Nose, Throat)",
  "Psychiatrist (Mental Health)",
  "Ophthalmologist (Eye Specialist)",
  "Dentist (Dental Surgeon)",
  "Pulmonologist (Lungs & Chest)",
  "Gastroenterologist (Digestive System)",
  "Oncologist (Cancer Specialist)",
  "Endocrinologist (Diabetes & Thyroid)",
  "Other Specialist"
];

const QUALIFICATIONS = [
  "MBBS",
  "MBBS, MD (General Medicine)",
  "MBBS, MS (General Surgery)",
  "MBBS, MD (Cardiology)",
  "MBBS, MD (Pediatrics)",
  "MBBS, MD (Dermatology)",
  "MBBS, DNB",
  "MD, DM (Cardiology)",
  "MD, DM (Neurology)",
  "MS, MCh (Surgeon)",
  "BDS (Dental)",
  "MDS (Master of Dental Surgery)",
  "BAMS (Ayurvedic Medicine)",
  "BHMS (Homeopathic Medicine)",
  "Other Qualification"
];

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || "PATIENT";

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    dob: "", age: "", speciality: SPECIALITIES[0],
    qualification: QUALIFICATIONS[0], address: "", phone: "", role: initialRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      speciality: newRole === "DOCTOR" ? (prev.speciality || SPECIALITIES[0]) : "",
      qualification: newRole === "DOCTOR" ? (prev.qualification || QUALIFICATIONS[0]) : ""
    }));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, formData);
      setToast({ message: "Registration successful! Redirecting to login...", type: "success" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Registration failed. Please try again.";
      setError(typeof msg === "string" ? msg : "Registration failed. Email may already be registered.");
      setToast({ message: "Registration failed. Email may already be in use.", type: "error" });
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate("/login")}
          style={{ background: "#F1F5F9", color: "#0D9488", fontWeight: 700 }}
        >
          Sign In
        </button>
      </nav>

      {/* ── REGISTER FORM CARD ── */}
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2 className="fw-bold mb-1" style={{ fontSize: "24px", color: "#0F172A" }}>Create an Account</h2>
          <p className="text-muted mb-4" style={{ fontSize: "14px" }}>Select account type and complete your medical profile</p>

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
            <div className="p-3 mb-3 rounded-2 text-danger" style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", fontSize: "13.5px" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Full Name *</label>
              <input
                className="auth-input"
                name="name"
                placeholder={role === "DOCTOR" ? "Dr. Full Name" : "Patient Full Name"}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label">Email Address *</label>
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Password * (Min 6 chars)</label>
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
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
                    value={formData.dob}
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
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="row g-2">
                {/* Speciality Dropdown */}
                <div className="col-sm-6">
                  <label className="form-label">Speciality *</label>
                  <select
                    className="auth-input"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    required
                  >
                    {SPECIALITIES.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Qualification Dropdown */}
                <div className="col-sm-6">
                  <label className="form-label">Qualification *</label>
                  <select
                    className="auth-input"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  >
                    {QUALIFICATIONS.map((qual) => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label">Clinic / Home Address</label>
                <input
                  className="auth-input"
                  name="address"
                  placeholder="e.g. Pune, Maharashtra"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Phone Number</label>
                <input
                  className="auth-input"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? "Registering Account..." : "Complete Registration"}
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
