import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";
import Toast from "./Toast";

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
  const [toast,        setToast]        = useState(null);

  // Notifications state (Point 4)
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [readNotifIds,    setReadNotifIds]    = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`doctor_read_notifs_${doctorId}`) || "[]");
    } catch {
      return [];
    }
  });

  // QR prescription state with structured dropdowns (Point 5)
  const emptyRx = {
    patientName: "",
    medicine: "",
    dosage: "1 Tablet",
    frequency: "Twice Daily (Morning & Night)",
    timing: "After Meals",
    duration: "5 Days",
    instructions: "",
    doctorName: user?.name || ""
  };
  const [rxForm,      setRxForm]      = useState(emptyRx);
  const [qrValue,     setQrValue]     = useState("");
  const [showQrForm,  setShowQrForm]  = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  // ── Load data ──
  const loadAppointments = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/appointments/doctor/${doctorId}`);
      setAppointments(r.data);
    } catch (e) {
      console.log(e);
    }
  };
  const loadPatients = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/auth/patients`);
      setPatients(r.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (doctorId) {
      loadAppointments();
      loadPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const handleShowRegisters = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/auth/all`);
      setAllUsers(r.data);
      setShowRegisters(!showRegisters);
    } catch (e) {
      console.log(e);
    }
  };

  // ── Notifications calculation (Point 4) ──
  const notifications = appointments.map(app => {
    const isRead = readNotifIds.includes(app.id);
    return {
      id: app.id,
      patientName: app.patient?.name || "Patient",
      patientEmail: app.patient?.email || "",
      enquiry: app.enquiry || "Consultation requested",
      status: app.status,
      isRead
    };
  });
  const unreadCount = notifications.filter(n => !n.isRead && n.status === "PENDING").length;

  const markNotificationRead = (id) => {
    const updated = [...readNotifIds, id];
    setReadNotifIds(updated);
    try {
      localStorage.setItem(`doctor_read_notifs_${doctorId}`, JSON.stringify(updated));
    } catch (e) {
      console.log(e);
    }
  };

  const markAllNotificationsRead = () => {
    const allIds = appointments.map(a => a.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem(`doctor_read_notifs_${doctorId}`, JSON.stringify(allIds));
    } catch (e) {
      console.log(e);
    }
    setToast({ message: "All notifications marked as read.", type: "info" });
  };

  // ── Upload prescription image (Point 7: Toastify instead of alert) ──
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendPrescription = async () => {
    if (!preview) {
      setToast({ message: "Please upload a prescription image.", type: "warning" });
      return;
    }
    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/appointments/approve/${selectedAppt.id}`, { imagePath: preview });
      setToast({ message: "Prescription submitted and sent to patient successfully!", type: "success" });
      setSelectedAppt(null);
      setPreview(null);
      loadAppointments();
    } catch {
      setToast({ message: "Error sending prescription. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Generate QR data (Point 5: Dropdown list fields included) ──
  const handleGenerateQR = () => {
    if (!rxForm.medicine.trim()) {
      setToast({ message: "Please enter medicine name.", type: "warning" });
      return;
    }
    const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const data = [
      "MedQRate Prescription",
      "-------------------",
      `Patient: ${rxForm.patientName || "General Patient"}`,
      `Doctor: Dr. ${rxForm.doctorName}`,
      `Medicine: ${rxForm.medicine}`,
      `Dosage: ${rxForm.dosage}`,
      `Time & Frequency: ${rxForm.frequency}`,
      `Meal Timing: ${rxForm.timing}`,
      `Duration: ${rxForm.duration}`,
      `Instructions: ${rxForm.instructions || "None"}`,
      `Date: ${date}`,
    ].join("\n");
    setQrValue(data);
    setQrGenerated(true);
    setToast({ message: "QR Prescription generated successfully!", type: "success" });
  };

  // ── Download QR image ──
  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `prescription_${rxForm.patientName || "patient"}_${Date.now()}.png`;
    a.click();
    setToast({ message: "Prescription QR downloaded!", type: "success" });
  };

  // ── Share on WhatsApp ──
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `💊 *MedQRate Prescription*\n\nPatient: ${rxForm.patientName || "General Patient"}\nDoctor: Dr. ${rxForm.doctorName}\nMedicine: ${rxForm.medicine}\nDosage: ${rxForm.dosage}\nFrequency: ${rxForm.frequency}\nMeal Timing: ${rxForm.timing}\nDuration: ${rxForm.duration}\nInstructions: ${rxForm.instructions || "None"}\n\n📲 Download the QR code from the MedQRate portal to store your prescription securely.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ── Copy prescription text ──
  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setToast({ message: "Prescription text copied to clipboard!", type: "info" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
          min-width: 130px;
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

      {/* ── NAVBAR (Point 3: Back arrow, Point 4: Notification Bell) ── */}
      <nav className="navbar px-4 px-md-5 py-3 doc-navbar">
        <div className="d-flex align-items-center gap-3">
          <a
            href="/"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            style={{ borderRadius: "8px", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}
          >
            ← Back to Home
          </a>

          <div className="d-flex align-items-center gap-2">
            <div className="logo-icon-badge">🩺</div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#0F172A", fontSize: "18px" }}>
                Med<span style={{ color: "#0D9488" }}>QRate</span>
              </h5>
              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Doctor Clinical Desk</div>
            </div>
          </div>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Notification Bell (Point 4) */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-light position-relative p-2"
              style={{
                borderRadius: "50%",
                border: "1px solid #E2E8F0",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
                cursor: "pointer",
                background: unreadCount > 0 ? "#F0FDFA" : "#FFFFFF"
              }}
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              title="Patient Consultation Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "10.5px", padding: "3px 6px" }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown / Panel */}
            {showNotifDrawer && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
                style={{
                  width: "360px",
                  maxWidth: "90vw",
                  zIndex: 1050,
                  borderColor: "#CBD5E1",
                  animation: "fadeUp 0.2s ease"
                }}
              >
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light rounded-top-3">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "16px" }}>🔔</span>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>
                      Patient Booking Alerts
                    </strong>
                    {unreadCount > 0 && (
                      <span className="badge bg-danger rounded-pill" style={{ fontSize: "11px" }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ fontSize: "12px", color: "#0D9488", fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted" style={{ fontSize: "13px" }}>
                      No appointment notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className="p-3 border-bottom"
                        style={{
                          background: n.isRead ? "#FFFFFF" : "#F0FDFA",
                          cursor: "pointer",
                          transition: "background 0.2s"
                        }}
                        onClick={() => {
                          if (!n.isRead) markNotificationRead(n.id);
                          const targetAppt = appointments.find(a => a.id === n.id);
                          if (targetAppt) {
                            setSelectedAppt(targetAppt);
                            const el = document.getElementById("appointment-requests-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }
                          setShowNotifDrawer(false);
                        }}
                      >
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div>
                            <div className="fw-bold" style={{ fontSize: "13.5px", color: "#0F172A" }}>
                              {n.patientName} booked an appointment
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: "12px", maxWidth: "230px" }}>
                              "{n.enquiry}"
                            </div>
                          </div>
                          {!n.isRead && (
                            <span
                              className="badge"
                              style={{ background: "#0D9488", color: "white", fontSize: "10px" }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-2" style={{ fontSize: "11px", color: "#64748B" }}>
                          <span>Status: <strong style={{ color: n.status === "APPROVED" ? "#10B981" : "#F59E0B" }}>{n.status}</strong></span>
                          <span style={{ color: "#0D9488", fontWeight: 600 }}>Review Details →</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 text-center bg-light rounded-bottom-3 border-top">
                  <button
                    className="btn btn-sm btn-link text-decoration-none"
                    style={{ fontSize: "12px", color: "#64748B" }}
                    onClick={() => setShowNotifDrawer(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

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

        {/* ── APPOINTMENT REQUESTS (Point 4: Targets for notifications) ── */}
        <div id="appointment-requests-section" className="mb-5">
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
                      className="btn btn-primary"
                      style={{
                        background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 16px",
                        fontSize: "13px",
                        fontWeight: 600
                      }}
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
                  className="btn btn-primary"
                  style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "13.5px",
                    fontWeight: 600
                  }}
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

        {/* ── QR PRESCRIPTION GENERATOR (Point 5: Dropdown lists for timing/frequency/duration) ── */}
        <div className="qr-wrap mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: "18px", color: "#0F172A" }}>
                📲 Digital QR Prescription Generator
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                Generate an encrypted digital prescription containing medication, dosage, schedule dropdowns and instructions
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
                    placeholder="e.g. Paracetamol 650mg / Amoxicillin 500mg"
                    value={rxForm.medicine}
                    onChange={e => setRxForm({ ...rxForm, medicine: e.target.value })}
                  />
                </div>
              </div>

              {/* Point 5: Dropdown list selectors for Dosage, Time & Frequency, Meal Timing, and Duration */}
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Dosage (खुराक)</label>
                  <select
                    className="form-select"
                    value={rxForm.dosage}
                    onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })}
                  >
                    <option value="1 Tablet">1 Tablet</option>
                    <option value="2 Tablets">2 Tablets</option>
                    <option value="0.5 Tablet (Half)">0.5 Tablet (Half)</option>
                    <option value="1 Capsule">1 Capsule</option>
                    <option value="2 Capsules">2 Capsules</option>
                    <option value="5 ml (1 Teaspoon)">5 ml (1 Teaspoon)</option>
                    <option value="10 ml (2 Teaspoons)">10 ml (2 Teaspoons)</option>
                    <option value="15 ml (1 Tablespoon)">15 ml (1 Tablespoon)</option>
                    <option value="1 Puff / Inhalation">1 Puff / Inhalation</option>
                    <option value="2 Puffs / Inhalations">2 Puffs / Inhalations</option>
                    <option value="2 Drops">2 Drops</option>
                    <option value="Apply Thin Layer">Apply Thin Layer (Ointment)</option>
                    <option value="Custom Dosage">Custom Dosage</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Time & Frequency (वेळ व वारंवारता)</label>
                  <select
                    className="form-select"
                    value={rxForm.frequency}
                    onChange={e => setRxForm({ ...rxForm, frequency: e.target.value })}
                  >
                    <option value="Once Daily (Morning)">Once Daily (Morning / सकाळी)</option>
                    <option value="Once Daily (Night)">Once Daily (Night / रात्री)</option>
                    <option value="Twice Daily (Morning & Night)">Twice Daily (Morning & Night / सकाळ-संध्याकाळ)</option>
                    <option value="Thrice Daily (Morning, Afternoon & Night)">Thrice Daily (सकाळ, दुपार व रात्र)</option>
                    <option value="Every 6 Hours (4 Times a Day)">Every 6 Hours (4 Times a Day)</option>
                    <option value="Every 8 Hours">Every 8 Hours</option>
                    <option value="Every 12 Hours">Every 12 Hours</option>
                    <option value="Once a Week">Once a Week</option>
                    <option value="As Needed (SOS / दुखणे असल्यास)">As Needed (SOS / दुखणे असल्यास)</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Meal Relationship (जेवण वेळेचे प्रमाण)</label>
                  <select
                    className="form-select"
                    value={rxForm.timing}
                    onChange={e => setRxForm({ ...rxForm, timing: e.target.value })}
                  >
                    <option value="After Meals">After Meals (जेवणानंतर)</option>
                    <option value="Before Meals (Empty Stomach)">Before Meals (रिकाम्या पोटी)</option>
                    <option value="With Meals">With Meals (जेवणासोबत)</option>
                    <option value="30 Minutes Before Meals">30 Minutes Before Meals</option>
                    <option value="At Bedtime">At Bedtime (झोपताना)</option>
                    <option value="Independent of Meals">Independent of Meals</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Duration (कालावधी)</label>
                  <select
                    className="form-select"
                    value={rxForm.duration}
                    onChange={e => setRxForm({ ...rxForm, duration: e.target.value })}
                  >
                    <option value="3 Days">3 Days</option>
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days (1 Week)">7 Days (1 Week)</option>
                    <option value="10 Days">10 Days</option>
                    <option value="14 Days (2 Weeks)">14 Days (2 Weeks)</option>
                    <option value="21 Days (3 Weeks)">21 Days (3 Weeks)</option>
                    <option value="1 Month (30 Days)">1 Month (30 Days)</option>
                    <option value="3 Months (Chronic Care)">3 Months (Chronic Care)</option>
                    <option value="SOS / Till Relief">SOS / Till Relief</option>
                  </select>
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
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 24px",
                  fontSize: "14px",
                  fontWeight: 600
                }}
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
                      ["Patient", rxForm.patientName || "General Patient"],
                      ["Doctor", `Dr. ${rxForm.doctorName}`],
                      ["Medicine", rxForm.medicine],
                      ["Dosage", rxForm.dosage],
                      ["Time & Frequency", rxForm.frequency],
                      ["Meal Timing", rxForm.timing],
                      ["Duration", rxForm.duration],
                      ["Instructions", rxForm.instructions || "None"],
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
