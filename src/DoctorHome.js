import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function DoctorHome() {
  const user      = JSON.parse(localStorage.getItem("user"));
  const doctorId  = user?.id;
  const qrRef     = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [allUsers,     setAllUsers]     = useState([]);
  const [showRegisters,setShowRegisters]= useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [copied,       setCopied]       = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // QR prescription state
  const emptyRx = { patientName:"", medicine:"", dosage:"", frequency:"", duration:"", instructions:"", doctorName: user?.name||"" };
  const [rxForm,      setRxForm]      = useState(emptyRx);
  const [qrValue,     setQrValue]     = useState("");
  const [showQrForm,  setShowQrForm]  = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  // ── Load data ──
  const loadAppointments = async () => {
    try { const r = await axios.get(`${BASE_URL}/appointments/doctor/${doctorId}`); setAppointments(r.data); }
    catch(e) { console.log(e); }
  };
  const loadPatients = async () => {
    try { const r = await axios.get(`${BASE_URL}/auth/patients`); setPatients(r.data); }
    catch(e) { console.log(e); }
  };
  const loadNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notifications/user/${doctorId}`);
      setNotifications(res.data);
    } catch(err) {
      console.log("Error loading notifications:", err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    if (doctorId) { 
      loadAppointments(); 
      loadPatients(); 
      loadNotifications();
    } 
  }, [doctorId]);

  const handleShowRegisters = async () => {
    try { const r = await axios.get(`${BASE_URL}/auth/all`); setAllUsers(r.data); setShowRegisters(!showRegisters); }
    catch(e) { console.log(e); }
  };

  // ── Mark Notification Read ──
  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${BASE_URL}/notifications/read/${id}`);
      await loadNotifications();
    } catch(err) {
      console.log(err);
    }
  };

  // ── Mark All Read ──
  const handleMarkAllRead = async () => {
    try {
      const unreads = notifications.filter(n => !n.read);
      await Promise.all(unreads.map(n => axios.put(`${BASE_URL}/notifications/read/${n.id}`)));
      await loadNotifications();
    } catch(err) {
      console.log(err);
    }
  };

  // ── Upload prescription image ──
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendPrescription = async () => {
    if (!preview) { alert("Please upload prescription image."); return; }
    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/appointments/approve/${selectedAppt.id}`, { imagePath: preview });
      alert("✅ Prescription sent successfully!");
      setSelectedAppt(null); setPreview(null); loadAppointments();
      loadNotifications(); // Refresh notifications
    } catch { alert("Error sending prescription"); }
    finally { setLoading(false); }
  };

  // ── Generate QR data ──
  const handleGenerateQR = () => {
    if (!rxForm.medicine.trim()) { alert("Please enter medicine name."); return; }
    const date = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
    const data = [
      "MedQRate Prescription",
      "-------------------",
      `Patient: ${rxForm.patientName}`,
      `Doctor: Dr. ${rxForm.doctorName}`,
      `Medicine: ${rxForm.medicine}`,
      `Dosage: ${rxForm.dosage}`,
      `Frequency: ${rxForm.frequency}`,
      `Duration: ${rxForm.duration}`,
      `Instructions: ${rxForm.instructions}`,
      `Date: ${date}`,
    ].join("\n");
    setQrValue(data);
    setQrGenerated(true);
  };

  // ── Download QR image ──
  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `prescription_${rxForm.patientName || "patient"}_${Date.now()}.png`;
    a.click();
  };

  // ── Share on WhatsApp ──
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `💊 *MedQRate Prescription*\n\nPatient: ${rxForm.patientName}\nDoctor: Dr. ${rxForm.doctorName}\nMedicine: ${rxForm.medicine}\nDosage: ${rxForm.dosage}\nFrequency: ${rxForm.frequency}\nDuration: ${rxForm.duration}\nInstructions: ${rxForm.instructions}\n\n📲 Download the QR image from the app and upload it on your Patient Dashboard to view the full prescription.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ── Copy prescription text ──
  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <>
      <style>{`
        .d-navbar {
          background: rgba(20, 10, 45, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 99;
        }
        .dash-card {
          background: rgba(30, 20, 50, 0.4) !important;
          backdrop-filter: blur(12px);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          transition: transform 0.2s, border-color 0.2s;
        }
        .dash-card:hover {
          transform: translateY(-3px);
          border-color: rgba(168,85,247,0.3);
        }
        .appt-card {
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          border-left: 5px solid #a855f7;
          margin-bottom: 14px;
        }
        .qr-wrap {
          background: rgba(30, 20, 50, 0.4);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(168, 85, 247, 0.2);
        }
        .gen-btn {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white; border: none; border-radius: 50px;
          padding: 11px 28px; font-weight: 700; cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(168,85,247,0.3);
        }
        .gen-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(168,85,247,0.45);
        }
        .dl-btn {
          background: linear-gradient(135deg,#2ecc71,#27ae60);
          color: white; border: none; border-radius: 50px;
          padding: 10px 24px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 12px rgba(46,204,113,0.3);
        }
        .wa-btn {
          background: linear-gradient(135deg,#25D366,#128C7E);
          color: white; border: none; border-radius: 50px;
          padding: 10px 24px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 12px rgba(37,211,102,0.3);
        }
        .qr-result {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          margin-top: 22px;
          animation: fadeUp 0.35s ease;
          text-align: center;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        
        .rx-table {
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 14px 18px;
          text-align: left;
          margin: 16px 0;
          font-size: 13px;
        }
        .rx-row { display:flex; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .rx-row:last-child { border-bottom:none; }
        .rx-lbl { font-weight:700; color:#d8b4fe; min-width:120px; }
        
        .step-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white; font-weight: 700; font-size: 13px;
          margin-right: 12px; flex-shrink: 0;
        }
        .step-row { display:flex; align-items:center; padding:8px 0; font-size:14px; color:#ccc; }
        
        .upload-zone {
          border: 2px dashed rgba(168, 85, 247, 0.4);
          border-radius: 14px; padding: 24px; text-align: center;
          background: rgba(255,255,255,0.02); cursor: pointer;
          transition: border-color 0.2s;
        }
        .upload-zone:hover { border-color: #a855f7; background: rgba(255,255,255,0.04); }
        
        /* Notifications drawer */
        .notif-drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; justify-content: flex-end; backdrop-filter: blur(3px);
        }
        .notif-drawer {
          width: 100%; maxWidth: 400px; height: 100%;
          background: rgba(30,20,50,0.98); backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255,255,255,0.08);
          padding: 24px; display: flex; flex-direction: column;
          color: white; box-shadow: -10px 0 40px rgba(0,0,0,0.5);
          animation: slideLeft 0.3s ease-out;
        }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .notif-item {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; padding: 14px; margin-bottom: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .notif-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(168,85,247,0.2); }
        .notif-item.unread { border-left: 4px solid #a855f7; background: rgba(168,85,247,0.05); }

        .bell-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: white; border-radius: 50%; width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative; transition: background 0.2s;
        }
        .bell-btn:hover { background: rgba(255,255,255,0.12); }
        .badge-count {
          position: absolute; top: -3px; right: -3px;
          background: #ff5555; color: white; border-radius: 50%;
          width: 20px; height: 20px; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(20,10,45,1);
        }
        
        .form-control, .form-select {
          background: rgba(255,255,255,0.05) !important;
          border: 1.5px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          border-radius: 12px;
        }
        .form-control::placeholder { color: rgba(255,255,255,0.4); }
        .form-control:focus, .form-select:focus {
          border-color: #a855f7 !important;
          box-shadow: 0 0 10px rgba(168,85,247,0.3) !important;
          background: rgba(255,255,255,0.08) !important;
        }
      `}</style>

      {/* ── NOTIFICATIONS DRAWER ── */}
      {showNotifDrawer && (
        <div className="notif-drawer-overlay" onClick={()=>setShowNotifDrawer(false)}>
          <div className="notif-drawer" onClick={e=>e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 text-white">🔔 Doctor Alerts</h5>
              <button className="btn btn-sm btn-outline-light rounded-circle" onClick={()=>setShowNotifDrawer(false)}>✕</button>
            </div>
            
            {notifications.length > 0 && (
              <button className="btn btn-sm btn-outline-info rounded-pill mb-3 align-self-start" onClick={handleMarkAllRead}>
                ✓ Mark all as read
              </button>
            )}

            <div style={{ flex:1, overflowY:"auto" }}>
              {notifications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div style={{ fontSize:40 }}>📭</div>
                  <p className="mt-2 text-white-50">No appointment alerts yet.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => handleMarkRead(n.id)}>
                    <div className="fw-bold" style={{ fontSize:13, color: !n.read ? '#d8b4fe' : '#ccc' }}>{n.title}</div>
                    <div style={{ fontSize:12, marginTop:4, opacity:0.8 }}>{n.message}</div>
                    <div style={{ fontSize:10, marginTop:6, opacity:0.5 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="navbar navbar-expand-lg px-4 px-md-5 py-3 d-navbar">
        <div className="d-flex align-items-center">
          <span style={{ fontSize:28, marginRight:10 }}>🏥</span>
          <div>
            <h5 className="fw-bold text-white mb-0">MedQRate</h5>
            <div style={{ fontSize:11, color:"#d4b8ff" }}>Doctor Dashboard</div>
          </div>
        </div>
        
        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Bell Icon */}
          <button className="bell-btn" onClick={() => setShowNotifDrawer(true)}>
            <span>🔔</span>
            {unreadNotifications.length > 0 && (
              <span className="badge-count">{unreadNotifications.length}</span>
            )}
          </button>

          <div className="text-white text-end d-none d-md-block me-2">
            <div className="fw-bold">Dr. {user?.name} 👨‍⚕️</div>
            <div style={{ fontSize:12, opacity:0.75 }}>General Practitioner</div>
          </div>
          <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            onClick={() => { localStorage.removeItem("user"); window.location = "/"; }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container py-4">

        {/* ── STATS COUNTERS ── */}
        <div className="row g-4 mb-4">
          {[
            { icon:"📅", label:"Appointment Inboxes", val: appointments.length, color:"#3b82f6", bg:"rgba(59,130,246,0.1)" },
            { icon:"👨‍👩‍👧", label:"Total Active Patients", val: patients.length,  color:"#2ecc71", bg:"rgba(46,204,113,0.1)" },
            { icon:"✅", label:"Prescriptions Approved",      val: appointments.filter(a=>a.status==="APPROVED").length, color:"#a855f7", bg:"rgba(168,85,247,0.1)" },
          ].map((s,i) => (
            <div className="col-md-4" key={i}>
              <div className="dash-card card p-4 text-center" style={{ background: s.bg }}>
                <div style={{ fontSize:38, marginBottom:6 }}>{s.icon}</div>
                <h2 className="fw-bold mb-0" style={{ color:s.color }}>{s.val}</h2>
                <div className="text-white-50 mt-1" style={{ fontSize:14 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── ALL REGISTERED USERS EXPANDER ── */}
        <div className="mb-4">
          <button className="btn btn-outline-light rounded-pill" onClick={handleShowRegisters}>
            {showRegisters ? "▲ Hide Registered Database" : "▼ Show All Registered Users"}
          </button>
          {showRegisters && (
            <div className="mt-3 card p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h6 className="fw-bold mb-3 text-white">Registered Accounts list</h6>
              <div className="row g-2" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {allUsers.map(u => (
                  <div className="col-md-4" key={u.id}>
                    <div className="card p-3 rounded-3 border-0 shadow-sm d-flex flex-row align-items-center gap-3" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05) !important" }}>
                      <span style={{ fontSize:22 }}>{u.role === "DOCTOR" ? "🩺" : "👤"}</span>
                      <div>
                        <div className="fw-bold text-white" style={{ fontSize:14 }}>{u.name}</div>
                        <div className="text-muted" style={{ fontSize:12 }}>{u.role} • {u.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── APPOINTMENT REQUESTS LIST ── */}
        <h4 className="fw-bold mb-3 text-white">📥 Appointment Inboxes</h4>
        {appointments.length === 0 && <p className="text-muted">No appointments found in database.</p>}
        <div className="row g-3 mb-4">
          {appointments.map(app => (
            <div className="col-12" key={app.id}>
              <div className="appt-card card p-4">
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                  <div>
                    <h6 className="fw-bold mb-1 text-white">🧑 Patient: {app.patient?.name}</h6>
                    <p className="mb-1 text-white-50" style={{ fontSize:13 }}>Symptoms/Enquiry: "{app.enquiry}"</p>
                    <p className="mb-0 text-muted" style={{ fontSize:11 }}>Received: {new Date(app.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {app.status === "PENDING" && (
                      <button className="btn btn-primary btn-sm rounded-pill px-3"
                        style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none" }}
                        onClick={() => { setSelectedAppt(app); setPreview(null); }}>
                        📤 Send Prescription
                      </button>
                    )}
                    {app.status === "APPROVED" && <span className="badge bg-success px-3 py-2 rounded-pill">✅ Approved</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── UPLOAD PRESCRIPTION IMAGE MODAL ── */}
        {selectedAppt && (
          <div className="card p-4 rounded-4 border-0 shadow-lg mb-4" style={{ borderLeft:"5px solid #2ecc71", background: "rgba(30,20,50,0.8)" }}>
            <h5 className="fw-bold mb-3 text-white">📤 Upload Prescription to <span style={{ color:"#d8b4fe" }}>{selectedAppt.patient?.name}</span></h5>
            <div className="upload-zone mb-3" onClick={() => document.getElementById("rxFileInput").click()}>
              {preview
                ? <img src={preview} alt="Preview" style={{ maxWidth:300, borderRadius:10 }} />
                : <><div style={{ fontSize:40 }}>🖼️</div><p className="mb-0 mt-2 fw-semibold text-white">Click to upload prescription image</p><p className="text-muted" style={{ fontSize:12 }}>PNG, JPG supported (Max 10MB)</p></>
              }
              <input id="rxFileInput" type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageChange} />
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-success rounded-pill px-4" onClick={handleSendPrescription} disabled={loading}>
                {loading ? "⏳ Sending..." : "✅ Approve & Send"}
              </button>
              <button className="btn btn-outline-light rounded-pill" onClick={() => { setSelectedAppt(null); setPreview(null); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ── QR PRESCRIPTION GENERATOR ── */}
      <div className="container mb-5">
        <div className="qr-wrap">

          {/* Header */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
            <div>
              <h4 className="mb-0 fw-bold" style={{ color:"#d8b4fe" }}>📲 QR Prescription Generator</h4>
              <p className="text-muted mb-0" style={{ fontSize:13, color: "#ccc", marginTop:4 }}>
                Encode details in a standard QR image → Patients scan it to trigger auto reminders.
              </p>
            </div>
            <button className="gen-btn" onClick={() => { setShowQrForm(!showQrForm); setQrValue(""); setQrGenerated(false); }}>
              {showQrForm ? "✕ Close Generator" : "+ Create Prescription QR"}
            </button>
          </div>

          {/* How it works */}
          {!showQrForm && !qrGenerated && (
            <div className="card p-4 border-0" style={{ background:"rgba(0,0,0,0.15)" }}>
              <p className="fw-bold mb-3" style={{ color:"#d8b4fe" }}>📋 Generator Flow:</p>
              {[
                ["1","Fill out patient diagnosis details and medicine dosage"],
                ["2","Click Generate QR Code"],
                ["3","Download the QR image file"],
                ["4","Send it to the patient via WhatsApp / Email"],
                ["5","Patient scans or uploads the file to import their daily alerts instantly ✅"],
              ].map(([n,t]) => (
                <div className="step-row" key={n}>
                  <span className="step-badge">{n}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}

          {/* Generator Form */}
          {showQrForm && (
            <div style={{ background:"rgba(0,0,0,0.15)", borderRadius:16, padding:24, border: "1px solid rgba(255,255,255,0.06)", marginTop:16, animation:"fadeUp 0.3s ease" }}>
              <h6 className="fw-bold mb-4 text-white-50" style={{ fontSize:15 }}>🩺 Prescription Form Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-white">Patient Name</label>
                  <input className="form-control" placeholder="e.g. Alice Cooper"
                    value={rxForm.patientName} onChange={e => setRxForm({...rxForm, patientName:e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-white">Doctor Name</label>
                  <input className="form-control" value={rxForm.doctorName}
                    onChange={e => setRxForm({...rxForm, doctorName:e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-white">💊 Medicine Name *</label>
                  <input className="form-control" placeholder="e.g. Paracetamol 650mg"
                    value={rxForm.medicine} onChange={e => setRxForm({...rxForm, medicine:e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-white">Dosage</label>
                  <input className="form-control" placeholder="e.g. 1 capsule"
                    value={rxForm.dosage} onChange={e => setRxForm({...rxForm, dosage:e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-white">Frequency</label>
                  <select className="form-select" value={rxForm.frequency}
                    onChange={e => setRxForm({...rxForm, frequency:e.target.value})}>
                    <option value="">Select</option>
                    <option>Once a day</option>
                    <option>Twice a day</option>
                    <option>Three times a day</option>
                    <option>Before meals</option>
                    <option>After meals</option>
                    <option>At bedtime</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-white">Duration</label>
                  <input className="form-control" placeholder="e.g. 5 days"
                    value={rxForm.duration} onChange={e => setRxForm({...rxForm, duration:e.target.value})} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold text-white">Special Instructions</label>
                  <input className="form-control" placeholder="e.g. Take with warm milk, avoid coffee"
                    value={rxForm.instructions} onChange={e => setRxForm({...rxForm, instructions:e.target.value})} />
                </div>
                <div className="col-12 d-flex gap-2 flex-wrap mt-2">
                  <button className="gen-btn" onClick={handleGenerateQR}>🔲 Generate QR Code</button>
                  <button className="btn btn-outline-light rounded-pill" onClick={() => { setRxForm(emptyRx); setQrValue(""); setQrGenerated(false); }}>Reset</button>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Canvas Result */}
          {qrValue && (
            <div className="qr-result">
              <h6 style={{ color:"#2ecc71", fontWeight:800, fontSize:17 }}>✅ QR Code Generated Successfully!</h6>
              <p className="text-white-50 mb-4" style={{ fontSize:13 }}>Share the downloaded image with patient {rxForm.patientName ? `(${rxForm.patientName})` : ""}</p>

              {/* Canvas */}
              <div style={{ display:"inline-block", padding:18, background:"white", borderRadius:16, boxShadow:"0 10px 30px rgba(0,0,0,0.5)", marginBottom:20 }}>
                <QRCodeCanvas ref={qrRef} value={qrValue} size={220} level="H" />
              </div>

              {/* Decoded Table */}
              <div className="rx-table">
                {[
                  ["Patient",      rxForm.patientName],
                  ["Doctor",       `Dr. ${rxForm.doctorName}`],
                  ["Medicine",     rxForm.medicine],
                  ["Dosage",       rxForm.dosage],
                  ["Frequency",    rxForm.frequency],
                  ["Duration",     rxForm.duration],
                  ["Instructions", rxForm.instructions],
                  ["Date",         new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })],
                ].map(([l,v]) => v ? (
                  <div className="rx-row" key={l}>
                    <span className="rx-lbl">{l}:</span>
                    <span className="text-white">{v}</span>
                  </div>
                ) : null)}
              </div>

              {/* Action Triggers */}
              <div className="d-flex gap-2 flex-wrap justify-content-center mt-3">
                <button className="dl-btn" onClick={handleDownloadQR}>⬇️ Download QR Image</button>
                <button className="wa-btn" onClick={handleWhatsApp}>📱 Share on WhatsApp</button>
                <button className="btn btn-outline-light rounded-pill px-4" onClick={handleCopy}>
                  {copied ? "✅ Copied text!" : "📋 Copy raw text"}
                </button>
              </div>

              <div style={{ background:"rgba(255, 193, 7, 0.1)", border: "1px solid rgba(255, 193, 7, 0.2)", borderRadius:10, padding:"12px 16px", marginTop:20, fontSize:13, color:"#ffd54f", textContent: "left" }}>
                💡 <strong>Instructions:</strong> Download the prescription image → Send it via email or whatsapp. The patient uploads it on their dashboard to read and toggle medicine alerts.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="text-white pt-5 pb-3 border-top border-secondary" style={{ background:"#0a0518" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold">🏥 MedQRate</h5>
              <p className="mt-2 text-white-50" style={{ fontSize: 13 }}>Smart Healthcare Appointment & Prescription Management System.</p>
              <p style={{ fontSize: 13, color: "#ccc" }}>📍 Chinchwad, Pune, Maharashtra</p>
              <p style={{ fontSize: 13, color: "#ccc" }}>📧 healthcare@gmail.com</p>
              <p style={{ fontSize: 13, color: "#ccc" }}>📞 +91 9876543210</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">⏳ Appointment Timing</h5>
              <p className="mt-2 text-white-50" style={{ fontSize: 13 }}>Mon – Fri: 9AM – 6PM</p>
              <p className="text-white-50" style={{ fontSize: 13 }}>Saturday: 9AM – 2PM</p>
              <p className="text-white-50" style={{ fontSize: 13 }}>Sunday: Closed</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">📊 Social Connect</h5>
              <p className="mt-2 text-white-50" style={{ fontSize: 13, margin: 0 }}>Instagram • Facebook</p>
              <p className="text-white-50" style={{ fontSize: 13, margin: 0 }}>Youtube • Linkedin</p>
            </div>
          </div>
          <hr style={{ opacity:0.1 }} />
          <p className="text-center mb-0 text-white-50" style={{ opacity:0.7, fontSize: 12 }}>© 2026 MedQRate. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default DoctorHome;