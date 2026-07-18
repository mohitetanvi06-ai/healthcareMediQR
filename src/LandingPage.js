import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* ── MOBILE-FIRST STYLES ── */
        .land-navbar {
          background: rgba(20, 10, 45, 0.7);
          backdrop-filter: blur(12px);
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .land-logo { display:flex; align-items:center; gap:12px; }
        .land-logo img { width:42px; height:42px; border-radius:12px; object-fit:cover; border: 1.5px solid rgba(255,255,255,0.1); }
        .land-logo h3 { color:white; font-weight:900; margin:0; font-size:clamp(18px,4vw,24px); letter-spacing: -0.5px; }
        .nav-btns { display:flex; gap:10px; }
        .btn-login  { background:rgba(255,255,255,0.08); color:white; border:1.5px solid rgba(255,255,255,0.25); border-radius:50px; padding:8px 22px; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.3s ease; }
        .btn-login:hover { background:rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); transform: translateY(-1px); }
        .btn-start  { background: linear-gradient(135deg, #a855f7, #3b82f6); color:white; border:none; border-radius:50px; padding:9px 24px; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.3s ease; box-shadow: 0 4px 15px rgba(168,85,247,0.3); }
        .btn-start:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(168,85,247,0.5); }

        /* ── HERO ── */
        .hero-section {
          min-height: 88vh;
          background-image: linear-gradient(rgba(10, 5, 25, 0.88), rgba(20, 10, 45, 0.88)), url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        .hero-card {
          background: rgba(30, 20, 50, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: clamp(30px,6vw,54px);
          max-width: 650px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0,0,0,0.4);
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .hero-icon { width:74px; height:74px; background:linear-gradient(135deg,#a855f7,#3b82f6); border-radius:24px; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow: 0 8px 24px rgba(168,85,247,0.3); }
        .hero-title { font-size:clamp(24px,5vw,42px); font-weight:900; color:white; margin-bottom:14px; letter-spacing: -0.8px; }
        .hero-title span { background: linear-gradient(135deg, #d8b4fe, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-sub { font-size:clamp(14px,3vw,17px); color:#b3b3cc; margin-bottom:32px; line-height:1.6; }
        .hero-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
        .hero-btn-doc { background:linear-gradient(135deg,#a855f7,#6366f1); color:white; border:none; border-radius:50px; padding:13px 30px; font-weight:700; font-size:clamp(13px,3vw,15px); cursor:pointer; transition:all 0.3s ease; box-shadow: 0 4px 15px rgba(168,85,247,0.25); }
        .hero-btn-doc:hover { transform:translateY(-2px); box-shadow: 0 6px 20px rgba(168,85,247,0.45); }
        .hero-btn-pat { background:rgba(255,255,255,0.05); color:white; border:1.5px solid rgba(255,255,255,0.2); border-radius:50px; padding:12px 28px; font-weight:700; font-size:clamp(13px,3vw,15px); cursor:pointer; transition:all 0.3s ease; }
        .hero-btn-pat:hover { background:rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); transform:translateY(-2px); }

        /* already have account */
        .already { margin-top:24px; font-size:14px; color:#aaa; }
        .already span { color:#d8b4fe; font-weight:700; cursor:pointer; text-decoration:underline; }

        /* ── FEATURES ── */
        .features-section { background:#120a2a; padding:80px 20px; border-top: 1px solid rgba(255,255,255,0.03); }
        .feat-card { background:rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius:20px; padding:28px; box-shadow:0 4px 20px rgba(0,0,0,0.15); transition:all 0.3s ease; height:100%; }
        .feat-card:hover { transform:translateY(-6px); background:rgba(255, 255, 255, 0.06); border-color: rgba(255,255,255,0.1); }
        .feat-icon { font-size:40px; margin-bottom:16px; display:inline-block; }

        /* ── CTA ── */
        .cta-section { background:linear-gradient(135deg,#2c0060,#120720); border-top: 1px solid rgba(255,255,255,0.05); padding:80px 20px; text-align:center; color:white; }

        /* ── FOOTER ── */
        .land-footer { background:#0a0518; border-top: 1px solid rgba(255,255,255,0.05); color:white; padding:50px 20px 20px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="land-navbar">
        <div className="land-logo">
          <img src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg" alt="logo" />
          <h3>MedQRate</h3>
        </div>
        <div className="nav-btns">
          <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-start" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-card">
          <div className="hero-icon">🏥</div>
          <h1 className="hero-title">
            Smart Healthcare Through <span>Innovation</span>
          </h1>
          <p className="hero-sub">
            Connect doctors and patients seamlessly. Manage prescriptions,
            book appointments, and never miss your medication schedule.
          </p>
          <div className="hero-btns">
            <button className="hero-btn-doc" onClick={() => navigate("/register", { state: { role: "DOCTOR" } })}>
              🩺 I'm a Doctor
            </button>
            <button className="hero-btn-pat" onClick={() => navigate("/register", { state: { role: "PATIENT" } })}>
              👤 I'm a Patient
            </button>
          </div>
          <p className="already">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color:"#4B0082" }}>✨ Everything You Need</h2>
            <p className="text-muted">Modern digital solutions for doctors and patients.</p>
          </div>
          <div className="row g-4">
            {[
              { icon:"📄", title:"Digital Prescriptions", desc:"Generate and share secure QR prescriptions instantly." },
              { icon:"⏰", title:"Smart Reminders", desc:"Never miss a dose with alarm-based medicine reminders." },
              { icon:"📅", title:"Easy Appointments", desc:"Book nearby doctors in seconds, anytime." },
              { icon:"📊", title:"Doctor Dashboard", desc:"Manage patients and approve appointments efficiently." },
              { icon:"📱", title:"Patient Portal", desc:"Access your prescriptions and health data anytime." },
              { icon:"🔒", title:"Secure & Private", desc:"Your medical data is protected and private." },
            ].map((item, i) => (
              <div className="col-md-4 col-sm-6" key={i}>
                <div className="feat-card">
                  <div className="feat-icon">{item.icon}</div>
                  <h5 className="fw-bold" style={{ color:"#4B0082" }}>{item.title}</h5>
                  <p className="text-muted mt-2" style={{ fontSize:14 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="fw-bold">🚀 Ready to Transform Healthcare?</h2>
          <p className="mt-3 mb-4">Join doctors and patients already using MedQRate.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="hero-btn-doc" style={{ fontSize:16, padding:"13px 30px" }} onClick={() => navigate("/register")}>
              Get Started Free
            </button>
            <button className="btn-login" style={{ fontSize:16, padding:"13px 30px" }} onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold">🏥 MedQRate</h5>
              <p className="mt-2" style={{ opacity:0.8, fontSize:14 }}>Smart Healthcare Appointment & Prescription Management.</p>
              <p style={{ fontSize:13 }}>📍 Chinchwad, Pune, Maharashtra</p>
              <p style={{ fontSize:13 }}>📧 healthcare@gmail.com</p>
              <p style={{ fontSize:13 }}>📞 +91 9876543210</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">⏳ Timings</h5>
              <p className="mt-2" style={{ fontSize:13 }}>Mon – Fri: 9AM – 6PM</p>
              <p style={{ fontSize:13 }}>Saturday: 9AM – 2PM</p>
              <p style={{ fontSize:13 }}>Sunday: Closed</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">🔗 Quick Links</h5>
              <p className="mt-2" style={{ cursor:"pointer", fontSize:13 }} onClick={() => navigate("/login")}>🔐 Login</p>
              <p style={{ cursor:"pointer", fontSize:13 }} onClick={() => navigate("/register", { state:{ role:"DOCTOR" } })}>🩺 Register as Doctor</p>
              <p style={{ cursor:"pointer", fontSize:13 }} onClick={() => navigate("/register", { state:{ role:"PATIENT" } })}>👤 Register as Patient</p>
            </div>
          </div>
          <hr style={{ opacity:0.3, marginTop:30 }} />
          <p className="text-center mb-0" style={{ opacity:0.7, fontSize:13 }}>© 2026 MedQRate. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
