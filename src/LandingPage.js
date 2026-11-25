import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const CLINICAL_FEATURES = [
  {
    id: "qr-rx",
    icon: "📄",
    title: "Digital QR Prescriptions",
    desc: "Generate, download, and share structured medical prescriptions with a single click.",
    badge: "Paperless & Instant",
    details: {
      overview: "Eliminate handwriting errors, lost prescription slips, and pharmacy misinterpretations with high-density encrypted QR codes.",
      patientBenefits: "Store medical prescriptions directly on your phone. Scan using camera or image upload to view dosage anytime.",
      doctorBenefits: "Generate standard digital prescriptions in under 30 seconds with dosage schedules, meal timings, and special instructions.",
      howItWorks: "1. Doctor fills medication, dosage & duration. 2. QR code is generated instantly. 3. Patient scans or downloads it to set automated reminders."
    }
  },
  {
    id: "reminders",
    icon: "⏰",
    title: "Smart Pill Reminders",
    desc: "Never miss medications with browser notification alerts and audio synthesizer chimes.",
    badge: "Audio-Visual Alerts",
    details: {
      overview: "Patient adherence to medication is essential for recovery. MedQRate features built-in Web Audio synthesis and HTML5 Notifications.",
      patientBenefits: "Timely alerts with customized frequencies (Daily, Weekdays, Weekends) so you never skip or double-dose medication.",
      doctorBenefits: "Reduces relapse rates and complications caused by skipped antibiotic courses or irregular chronic disease medication.",
      howItWorks: "1. Tap 'Set Reminder' directly from your digital prescription. 2. Browser chimes at the exact scheduled time with clear medicine names."
    }
  },
  {
    id: "appointments",
    icon: "📅",
    title: "Seamless Appointments",
    desc: "Find specialist doctors by name or discipline and book consultations effortlessly.",
    badge: "Specialist Directory",
    details: {
      overview: "Search an extensive clinical directory of certified physicians, cardiologists, dermatologists, and specialists in your vicinity.",
      patientBenefits: "View doctor qualifications (MBBS, MD), speciality, clinic address, and book consultations in just a few taps.",
      doctorBenefits: "Receive organized consultation requests with chief complaints and symptoms highlighted before patient visit.",
      howItWorks: "1. Search doctor by discipline. 2. Enter symptoms. 3. Doctor receives instant desktop notification to review and prescribe."
    }
  },
  {
    id: "doctor-desk",
    icon: "📊",
    title: "Doctor Clinical Desk",
    desc: "Review patient enquiries, attach prescription charts, and track daily clinical load.",
    badge: "Physician Hub",
    details: {
      overview: "An all-in-one clinical management cockpit designed specifically for busy medical practitioners and hospital clinics.",
      patientBenefits: "Faster consultation responses and structured electronic medical records attached to your profile.",
      doctorBenefits: "Track pending appointment requests, view registered patient directories, and attach digital prescriptions easily.",
      howItWorks: "1. Doctor logs into the practitioner portal. 2. Reviews pending enquiries. 3. Approves and uploads digital QR chart."
    }
  },
  {
    id: "patient-hub",
    icon: "📱",
    title: "Patient Health Hub",
    desc: "Track appointment progress, download QR cards, and manage dosage times in one portal.",
    badge: "Personal Health Desk",
    details: {
      overview: "A clean, private medical dashboard putting your medical appointments, prescriptions, and dosage routines in one place.",
      patientBenefits: "No bulky physical files required. Access your verified prescription history from any phone, laptop, or tablet.",
      doctorBenefits: "Patients arrive better prepared with organized past consultation records and clear symptom timelines.",
      howItWorks: "1. Log in to Patient Dashboard. 2. View approved doctor prescriptions. 3. Toggle intake schedules with simple switches."
    }
  },
  {
    id: "security",
    icon: "🔒",
    title: "Secure & Compliant",
    desc: "Encrypted data transmission keeping patient medical records and vitals safeguarded.",
    badge: "Enterprise Security",
    details: {
      overview: "Medical data requires maximum confidentiality. MedQRate uses secure SHA-256 cryptographic hashing and role-based access control.",
      patientBenefits: "Your personal health records, consultation enquiries, and prescriptions remain strictly confidential.",
      doctorBenefits: "Complies with modern electronic medical records (EMR) guidelines for authorized doctor-patient communications.",
      howItWorks: "1. Passwords hashed using SHA-256. 2. Role-based isolation ensures patients only see their own prescriptions."
    }
  }
];

function LandingPage() {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        /* ── NAVBAR ── */
        .land-navbar {
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
        }
        .land-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-icon-badge {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
          box-shadow: 0 4px 10px rgba(13, 148, 136, 0.25);
        }
        .land-logo h3 {
          color: #0F172A;
          font-weight: 800;
          margin: 0;
          font-size: 22px;
          letter-spacing: -0.03em;
        }
        .land-logo span {
          color: #0D9488;
        }
        .nav-btns {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-nav-login {
          background: transparent;
          color: #334155;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-nav-login:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #94A3B8;
        }
        .btn-nav-register {
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          padding: 8px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
        }
        .btn-nav-register:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        /* ── HERO SECTION ── */
        .hero-section {
          background: radial-gradient(circle at 50% 0%, #EFF6FF 0%, #F8FAFC 80%);
          padding: 70px 20px 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hero-container {
          max-width: 820px;
          width: 100%;
          text-align: center;
        }
        .trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #F0FDFA;
          border: 1px solid #CCFBF1;
          color: #0F766E;
          border-radius: 30px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .trust-dot {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
        .hero-title {
          font-size: clamp(32px, 5.5vw, 52px);
          font-weight: 800;
          color: #0F172A;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -0.03em;
        }
        .hero-title span {
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: clamp(16px, 2.5vw, 19px);
          color: #475569;
          margin: 0 auto 36px;
          max-width: 680px;
          line-height: 1.6;
        }
        .hero-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.4);
        }
        .hero-btn-secondary {
          background: #FFFFFF;
          color: #0F172A;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 14px 28px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-btn-secondary:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
          transform: translateY(-2px);
        }
        .hero-stats-bar {
          margin-top: 48px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
        }
        .hero-stat-item {
          text-align: center;
        }
        .hero-stat-num {
          font-size: 20px;
          font-weight: 800;
          color: #0D9488;
        }
        .hero-stat-lbl {
          font-size: 12px;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── FEATURES ── */
        .features-section {
          background: #FFFFFF;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
          padding: 80px 20px;
        }
        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }
        .section-tag {
          color: #0D9488;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .section-title {
          font-size: 32px;
          font-weight: 800;
          color: #0F172A;
        }
        .feat-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 26px;
          height: 100%;
          transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -6px rgba(13, 148, 136, 0.15);
          border-color: #0D9488;
        }
        .feat-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: #F0FDFA;
          border: 1px solid #CCFBF1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 18px;
        }
        .feat-card h5 {
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 10px;
        }
        .feat-card p {
          color: #64748B;
          font-size: 14.5px;
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .feat-learn-more {
          margin-top: 16px;
          font-size: 13px;
          font-weight: 700;
          color: #0D9488;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ── MODAL ── */
        .feat-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .feat-modal-box {
          background: #FFFFFF;
          border-radius: 20px;
          max-width: 580px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* ── CTA ── */
        .cta-section {
          background: linear-gradient(135deg, #0F766E 0%, #0369A1 100%);
          padding: 70px 20px;
          text-align: center;
          color: white;
        }
        .cta-section h2 {
          color: white;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
          margin-bottom: 12px;
        }
        .cta-section p {
          color: #E0F2FE;
          font-size: 17px;
          max-width: 600px;
          margin: 0 auto 32px;
        }
        .btn-cta-primary {
          background: #FFFFFF;
          color: #0F766E;
          border: none;
          border-radius: 12px;
          padding: 13px 30px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }
        .btn-cta-primary:hover {
          background: #F8FAFC;
          transform: translateY(-2px);
        }
        .btn-cta-secondary {
          background: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          padding: 13px 30px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* ── FOOTER ── */
        .land-footer {
          background: #0F172A;
          color: #94A3B8;
          padding: 50px 20px 24px;
          margin-top: auto;
        }
        .land-footer h5 {
          color: #FFFFFF;
          font-size: 17px;
          margin-bottom: 16px;
        }
        .footer-link {
          color: #CBD5E1;
          font-size: 14px;
          text-decoration: none;
          display: block;
          margin-bottom: 8px;
          cursor: pointer;
        }
        .footer-link:hover {
          color: #38BDF8;
        }
      `}</style>

      {/* ── CLINICAL FEATURE DETAILS MODAL (Point 8) ── */}
      {selectedFeature && (
        <div className="feat-modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="feat-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "#F0FDFA",
                  border: "1.5px solid #CCFBF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28
                }}>
                  {selectedFeature.icon}
                </div>
                <div>
                  <span style={{ background: "#E0F2FE", color: "#0369A1", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    {selectedFeature.badge}
                  </span>
                  <h4 className="fw-bold mb-0 mt-1" style={{ color: "#0F172A", fontSize: 20 }}>
                    {selectedFeature.title}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                style={{ background: "#F1F5F9", border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "#64748B" }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#475569", fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>
              {selectedFeature.details.overview}
            </p>

            {/* Benefits Grid */}
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, height: "100%" }}>
                  <div className="fw-bold mb-1" style={{ color: "#0D9488", fontSize: 13.5 }}>
                    👤 For Patients
                  </div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                    {selectedFeature.details.patientBenefits}
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, height: "100%" }}>
                  <div className="fw-bold mb-1" style={{ color: "#0284C7", fontSize: 13.5 }}>
                    🩺 For Doctors & Clinics
                  </div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                    {selectedFeature.details.doctorBenefits}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow steps */}
            <div style={{ background: "#F0FDFA", border: "1px solid #CCFBF1", borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <div className="fw-bold mb-1" style={{ color: "#0F766E", fontSize: 13.5 }}>
                ⚡ How It Works in MedQRate:
              </div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                {selectedFeature.details.howItWorks}
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-light"
                style={{ border: "1px solid #CBD5E1", borderRadius: 10, padding: "8px 18px", fontSize: 14, fontWeight: 600 }}
                onClick={() => setSelectedFeature(null)}
              >
                Close
              </button>
              <button
                className="btn-nav-register"
                style={{ padding: "8px 22px", fontSize: 14 }}
                onClick={() => navigate("/register")}
              >
                Get Started with this Feature →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="land-navbar">
        <div className="land-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <div className="logo-icon-badge">🩺</div>
          <h3>Med<span>QRate</span></h3>
        </div>
        <div className="nav-btns">
          <button className="btn-nav-login" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="btn-nav-register" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="trust-pill">
            <span className="trust-dot"></span>
            Smart Healthcare Appointment & QR Prescription Network
          </div>

          <h1 className="hero-title">
            Smart Healthcare Through <span>Innovation</span>
          </h1>

          <p className="hero-sub">
            Connect licensed doctors and patients seamlessly. Issue encrypted digital QR prescriptions,
            manage appointment schedules, and stay on track with smart audio medication reminders.
          </p>

          <div className="hero-btns">
            <button
              className="hero-btn-primary"
              onClick={() => navigate("/register", { state: { role: "DOCTOR" } })}
            >
              <span>👨‍⚕️</span> Register as Doctor
            </button>
            <button
              className="hero-btn-secondary"
              onClick={() => navigate("/register", { state: { role: "PATIENT" } })}
            >
              <span>👤</span> Register as Patient
            </button>
          </div>

          <p className="mt-3 text-muted" style={{ fontSize: "14px" }}>
            Already have an account?{" "}
            <span
              style={{ color: "#0D9488", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/login")}
            >
              Sign In here
            </span>
          </p>

          {/* Quick Metrics */}
          <div className="hero-stats-bar">
            <div className="hero-stat-item">
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-lbl">Digital Prescriptions</div>
            </div>
            <div className="hero-stat-item" style={{ borderLeft: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0", padding: "0 24px" }}>
              <div className="hero-stat-num">Instant</div>
              <div className="hero-stat-lbl">QR Code Check-in</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">24 / 7</div>
              <div className="hero-stat-lbl">Medicine Reminders</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLINICAL FEATURES SECTION (Point 8) ── */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Clinical Features</div>
            <h2 className="section-title">Designed for Modern Medical Practice</h2>
            <p className="text-muted mt-2" style={{ maxWidth: "560px", margin: "0 auto", fontSize: "15px" }}>
              Click any clinical feature below to explore its workflow, clinical advantages, and patient benefits.
            </p>
          </div>

          <div className="row g-4">
            {CLINICAL_FEATURES.map((item) => (
              <div className="col-md-4 col-sm-6" key={item.id}>
                <div
                  className="feat-card"
                  onClick={() => setSelectedFeature(item)}
                  title="Click to learn more"
                >
                  <div className="feat-icon-box">{item.icon}</div>
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                  <div className="feat-learn-more">
                    Learn clinical details <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Experience Modern Healthcare?</h2>
          <p>
            Join doctors and patients who rely on MedQRate for fast, organized, and error-free healthcare management.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-cta-primary" onClick={() => navigate("/register")}>
              Create Free Account
            </button>
            <button className="btn-cta-secondary" onClick={() => navigate("/login")}>
              Sign In to Portal
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-5">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span style={{ fontSize: "22px" }}>🩺</span>
                <h5 className="mb-0 text-white">MedQRate Health Portal</h5>
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Smart Healthcare Appointment & Prescription Management System designed for clinics, physicians, and patients.
              </p>
              <div style={{ fontSize: "13px", color: "#64748B" }}>
                📍 Chinchwad, Pune, Maharashtra 411019<br />
                📧 support@medqrate.com | 📞 +91 9876543210
              </div>
            </div>

            <div className="col-md-3 offset-md-1">
              <h5>Clinical Timings</h5>
              <div style={{ fontSize: "13.5px", lineHeight: "1.8" }}>
                <div>Monday – Friday: 09:00 AM – 06:00 PM</div>
                <div>Saturday: 09:00 AM – 02:00 PM</div>
                <div>Sunday: Emergency Only</div>
              </div>
            </div>

            <div className="col-md-3">
              <h5>Quick Access</h5>
              <span className="footer-link" onClick={() => navigate("/login")}>🔐 Portal Sign In</span>
              <span className="footer-link" onClick={() => navigate("/register", { state: { role: "DOCTOR" } })}>🩺 Doctor Registration</span>
              <span className="footer-link" onClick={() => navigate("/register", { state: { role: "PATIENT" } })}>👤 Patient Registration</span>
            </div>
          </div>

          <hr style={{ borderColor: "#1E293B", margin: "32px 0 20px" }} />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="mb-0" style={{ fontSize: "13px" }}>© 2026 MedQRate Healthcare Technologies. All Rights Reserved.</p>
            <span style={{ fontSize: "12px", color: "#475569" }}>Light Theme Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
