import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function DoctorHome() {
  const user      = JSON.parse(localStorage.getItem("user"));
  const doctorId  = user?.id;

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
    if (!preview) { alert("Please upload a prescription image."); return; }
    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/appointments/approve/${selectedAppt.id}`, { imagePath: preview });
      alert("Prescription submitted and sent to patient successfully!");
      setSelectedAppt(null); setPreview(null); loadAppointments();
    } catch { alert("Error sending prescription. Please try again."); }
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
      `💊 *MedQRate Prescription*\n\nPatient: ${rxForm.patientName}\nDoctor: Dr. ${rxForm.doctorName}\nMedicine: ${rxForm.medicine}\nDosage: ${rxForm.dosage}\nFrequency: ${rxForm.frequency}\nDuration: ${rxForm.duration}\nInstructions: ${rxForm.instructions}\n\n📲 Download the QR code from the MedQRate portal to store your prescription securely.`
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
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        /* ── NAVBAR ── */
        .doc-navbar {
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo-icon-badge {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 19px;
        }
        .user-pill {
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: 30px;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-logout {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FEE2E2;
          border-radius: 8px;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-logout:hover {
          background: #FEE2E2;
          color: #B91C1C;
        }

        /* ── STATS CARDS ── */
        .stat-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.06);
        }
        .stat-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        .stat-num {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1;
        }
        .stat-label {
          color: #64748B;
          font-size: 13px;
          font-weight: 600;
          margin-top: 4px;
        }

        /* ── APPOINTMENT CARD ── */
        .appt-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 12px;
          border-left: 4px solid #0D9488;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        /* ── QR GENERATOR ── */
        .qr-wrap {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .qr-result {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          margin-top: 20px;
          text-align: center;
          animation: fadeUp 0.3s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rx-table {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 18px;
          text-align: left;
          margin: 16px 0;
          font-size: 13.5px;
        }
        .rx-row {
          display: flex;
          gap: 12px;
          padding: 6px 0;
          border-bottom: 1px solid #F1F5F9;
        }
        .rx-row:last-child {
          border-bottom: none;
        }
        .rx-lbl {
          font-weight: 700;
          color: #0F766E;
          min-width: 120px;
        }
        .upload-zone {
          border: 2px dashed #CBD5E1;
          border-radius: 14px;
          padding: 28px 20px;
          text-align: center;
          background: #F8FAFC;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .upload-zone:hover {
          border-color: #0D9488;
          background: #F0FDFA;
        }
        .badge-pending {
          background: #FFFBEB;
          color: #B45309;
          border: 1px solid #FDE68A;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-approved {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
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
      <nav className="navbar px-4 px-md-5 py-3 doc-navbar">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-icon-badge">🩺</div>
          <div>
            <h5 className="fw-bold mb-0" style={{ color: "#0F172A", fontSize: "18px" }}>
              Med<span style={{ color: "#0D9488" }}>QRate</span>
            </h5>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Doctor Clinical Desk</div>
          </div>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="user-pill d-none d-md-flex">
            <span style={{ fontSize: "16px" }}>👨‍⚕️</span>
            <div style={{ fontSize: "13px" }}>
              <strong>Dr. {user?.name || "Doctor"}</strong>
              <span className="text-muted ms-1">({user?.speciality || "Physician"})</span>
            </div>
          </div>
          <button
            className="btn-logout"
            onClick={() => { localStorage.removeItem("user"); window.location = "/"; }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <div className="container py-4" style={{ flex: 1, maxWidth: "1080px" }}>

        {/* ── STATS OVERVIEW ── */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: "#EFF6FF", color: "#0284C7" }}>
                📅
              </div>
              <div>
                <div className="stat-num">{appointments.length}</div>
                <div className="stat-label">Total Appointments</div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: "#F0FDFA", color: "#0D9488" }}>
                👥
              </div>
              <div>
                <div className="stat-num">{patients.length}</div>
                <div className="stat-label">Registered Patients</div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: "#ECFDF5", color: "#10B981" }}>
                ✅
              </div>
              <div>
                <div className="stat-num">
                  {appointments.filter(a => a.status === "APPROVED").length}
                </div>
                <div className="stat-label">Approved & Discharged</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ALL USERS TOGGLE ── */}
        <div className="mb-4">
          <button
            className="btn btn-light btn-sm"
            style={{ border: "1px solid #CBD5E1", borderRadius: "8px", fontWeight: 600, color: "#475569" }}
            onClick={handleShowRegisters}
          >
            {showRegisters ? "▲ Hide Registered Directory" : "▼ View Registered Doctors & Patients"}
          </button>

          {showRegisters && (
            <div className="mt-3 p-3 bg-white rounded-3 border" style={{ borderColor: "#E2E8F0" }}>
              <h6 className="fw-bold mb-3" style={{ fontSize: "14px" }}>System Directory ({allUsers.length} users)</h6>
              <div className="row g-2">
                {allUsers.map(u => (
                  <div className="col-md-4" key={u.id}>
                    <div className="p-2 px-3 rounded-2 border d-flex align-items-center gap-2" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                      <span>{u.role === "DOCTOR" ? "🩺" : "👤"}</span>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "13px" }}>{u.name}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748B" }}>{u.role} • {u.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── APPOINTMENT REQUESTS ── */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0" style={{ fontSize: "18px" }}>
              📥 Patient Consultation Requests
            </h5>
            <span style={{ fontSize: "13px", color: "#64748B" }}>
              {appointments.filter(a => a.status === "PENDING").length} Pending
            </span>
          </div>

          {appointments.length === 0 && (
            <div className="p-4 bg-white rounded-3 border text-center text-muted" style={{ borderColor: "#E2E8F0", fontSize: "14px" }}>
              No incoming appointment requests at this moment.
            </div>
          )}

          {appointments.map(app => (
            <div key={app.id} className="appt-card">
              <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "18px" }}>🧑</span>
                    <h6 className="fw-bold mb-0" style={{ fontSize: "15px", color: "#0F172A" }}>
                      {app.patient?.name}
                    </h6>
                    <span className="text-muted" style={{ fontSize: "12px" }}>({app.patient?.email})</span>
                  </div>
                  <p className="mb-0 mt-2 text-slate-700" style={{ fontSize: "13.5px" }}>
                    <strong>Chief Complaint:</strong> {app.enquiry}
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {app.status === "PENDING" && (
                    <button
                      className="btn-primary-medical"
                      style={{ padding: "6px 16px", fontSize: "13px" }}
                      onClick={() => { setSelectedAppt(app); setPreview(null); }}
                    >
                      📤 Review & Attach Prescription
                    </button>
                  )}
                  {app.status === "APPROVED" && (
                    <span className="badge-approved">✅ Approved & Sent</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ── UPLOAD PRESCRIPTION MODAL / SECTION ── */}
          {selectedAppt && (
            <div className="p-4 bg-white rounded-3 border mt-3 shadow-sm" style={{ borderColor: "#0D9488", borderLeft: "5px solid #0D9488" }}>
              <h5 className="fw-bold mb-2" style={{ fontSize: "16px", color: "#0F766E" }}>
                Attach Prescription for {selectedAppt.patient?.name}
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Upload the prescription chart, medical notes, or the QR code generated below.
              </p>

              <div className="upload-zone mb-3" onClick={() => document.getElementById("rxFileInput").click()}>
                {preview ? (
                  <div>
                    <img src={preview} alt="Prescription Preview" style={{ maxWidth: 280, maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
                    <div className="mt-2 text-primary fw-semibold" style={{ fontSize: "13px" }}>Click to replace file</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 36 }}>🖼️</div>
                    <div className="fw-semibold mt-2" style={{ color: "#0F172A", fontSize: "14px" }}>Click to choose prescription file</div>
                    <div className="text-muted" style={{ fontSize: "12px" }}>PNG, JPG or scanned QR supported</div>
                  </div>
                )}
                <input id="rxFileInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn-primary-medical"
                  style={{ padding: "8px 20px", fontSize: "13.5px" }}
                  onClick={handleSendPrescription}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "✅ Confirm & Send to Patient"}
                </button>
                <button
                  className="btn btn-light"
                  style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "8px 16px", fontSize: "13.5px" }}
                  onClick={() => { setSelectedAppt(null); setPreview(null); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── QR PRESCRIPTION GENERATOR ── */}
        <div className="qr-wrap mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: "18px", color: "#0F172A" }}>
                📲 Digital QR Prescription Generator
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                Generate an encrypted digital prescription containing medication, dosage and schedule
              </p>
            </div>
            <button
              className="btn btn-light btn-sm"
              style={{ border: "1px solid #CBD5E1", borderRadius: "8px", fontWeight: 600 }}
              onClick={() => setShowQrForm(!showQrForm)}
            >
              {showQrForm ? "▲ Collapse Generator" : "▼ Open Generator Tool"}
            </button>
          </div>

          {showQrForm && (
            <div className="mt-3">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Patient Name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Jane Smith"
                    value={rxForm.patientName}
                    onChange={e => setRxForm({ ...rxForm, patientName: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Medicine Name *</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Amoxicillin 500mg"
                    value={rxForm.medicine}
                    onChange={e => setRxForm({ ...rxForm, medicine: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Dosage</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 1 Tablet"
                    value={rxForm.dosage}
                    onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Frequency</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Twice daily (After meals)"
                    value={rxForm.frequency}
                    onChange={e => setRxForm({ ...rxForm, frequency: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Duration</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 5 Days"
                    value={rxForm.duration}
                    onChange={e => setRxForm({ ...rxForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Special Clinical Instructions</label>
                <input
                  className="form-control"
                  placeholder="e.g. Drink plenty of water, avoid dairy for 2 hours"
                  value={rxForm.instructions}
                  onChange={e => setRxForm({ ...rxForm, instructions: e.target.value })}
                />
              </div>

              <button
                className="btn-primary-medical"
                style={{ padding: "9px 24px", fontSize: "14px" }}
                onClick={handleGenerateQR}
              >
                ⚡ Generate Prescription QR
              </button>

              {/* QR Result */}
              {qrGenerated && qrValue && (
                <div className="qr-result">
                  <h6 className="fw-bold mb-3" style={{ color: "#0F172A" }}>Generated Prescription QR Code</h6>
                  <div className="p-3 bg-white d-inline-block rounded-3 border mb-3 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
                    <QRCodeCanvas value={qrValue} size={200} level="H" />
                  </div>

                  {/* Summary Table */}
                  <div className="rx-table" style={{ maxWidth: "540px", margin: "0 auto 16px" }}>
                    {[
                      ["Patient", rxForm.patientName || "Jane Smith"],
                      ["Doctor", `Dr. ${rxForm.doctorName}`],
                      ["Medicine", rxForm.medicine],
                      ["Dosage", rxForm.dosage],
                      ["Frequency", rxForm.frequency],
                      ["Duration", rxForm.duration],
                      ["Instructions", rxForm.instructions],
                      ["Issued Date", new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })]
                    ].map(([lbl, val]) => val ? (
                      <div className="rx-row" key={lbl}>
                        <span className="rx-lbl">{lbl}:</span>
                        <span>{val}</span>
                      </div>
                    ) : null)}
                  </div>

                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold"
                      onClick={handleDownloadQR}
                    >
                      ⬇️ Download PNG Image
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                      onClick={handleWhatsApp}
                    >
                      📱 Share via WhatsApp
                    </button>
                    <button
                      className="btn btn-sm btn-light rounded-pill px-3"
                      style={{ border: "1px solid #CBD5E1" }}
                      onClick={handleCopy}
                    >
                      {copied ? "✅ Copied" : "📋 Copy Plaintext"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0F172A", color: "#94A3B8", padding: "30px 20px 20px", marginTop: "auto" }}>
        <div className="container" style={{ maxWidth: "1080px" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="fw-bold text-white" style={{ fontSize: "15px" }}>🩺 MedQRate Clinical Practitioner Desk</div>
              <div style={{ fontSize: "12px", color: "#64748B" }}>Authorized Physician Access Only</div>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>
              Medical Helpline: +91 9876543210
            </div>
          </div>
          <hr style={{ borderColor: "#1E293B", margin: "16px 0 12px" }} />
          <p className="text-center mb-0" style={{ fontSize: "12px", color: "#475569" }}>
            © 2026 MedQRate Healthcare Technologies. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DoctorHome;
