import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import QRScanner from "./QRScanner";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// ── Alarm sound synthesizer via Web Audio API ──
function playAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[0,880,0.18],[0.25,1046,0.18],[0.5,1318,0.28],[1,880,0.18],[1.25,1046,0.18],[1.5,1318,0.28]]
      .forEach(([t,f,d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0, ctx.currentTime+t);
        g.gain.linearRampToValueAtTime(0.5, ctx.currentTime+t+0.02);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime+t+d);
        o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+d+0.05);
      });
  } catch(e) {}
}

function PatientHome() {
  const user      = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.id;

  const [doctors,       setDoctors]       = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [search,        setSearch]        = useState("");
  const [selectedDoc,   setSelectedDoc]   = useState(null);
  const [enquiry,       setEnquiry]       = useState("");
  const [loading,       setLoading]       = useState(false);

  // View prescription QR modal
  const [viewingRx, setViewingRx] = useState(null);

  // Vitals State
  const [vitals, setVitals] = useState([]);
  const [vitalsForm, setVitalsForm] = useState({ systolic: "", diastolic: "", heartRate: "", bloodSugar: "", weight: "" });

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scannedRx, setScannedRx] = useState(null);

  // Reminder state
  const emptyForm = { medicineName:"", times:[""], frequency:"daily", notes:"", sound:true };
  const [reminders,        setReminders]        = useState([]);
  const [reminderForm,     setReminderForm]     = useState(emptyForm);
  const [notifPerm,        setNotifPerm]        = useState(typeof Notification!=="undefined" ? Notification.permission : "denied");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [toast,            setToast]            = useState(null);
  const intervalRef = useRef(null);

  // ── Load Reminders from Backend ──
  const loadReminders = async () => {
    if (!patientId) return;
    try {
      const res = await axios.get(`${BASE_URL}/reminders/patient/${patientId}`);
      const mapped = res.data.map(r => ({
        id: r.id,
        medicineName: r.name,
        times: r.timing || [],
        frequency: r.frequency ? r.frequency.toLowerCase() : "daily",
        notes: r.dosage || "",
        sound: true,
        active: true,
        logs: r.logs || {}
      }));
      setReminders(mapped);
    } catch(err) {
      console.log("Error loading reminders:", err);
    }
  };

  // ── Load Vitals from Backend ──
  const loadVitals = async () => {
    if (!patientId) return;
    try {
      const res = await axios.get(`${BASE_URL}/vitals/patient/${patientId}`);
      setVitals(res.data);
    } catch(err) {
      console.log("Error loading vitals:", err);
    }
  };

  // ── Load Notifications ──
  const loadNotifications = async () => {
    if (!patientId) return;
    try {
      const res = await axios.get(`${BASE_URL}/notifications/user/${patientId}`);
      setNotifications(res.data);
    } catch(err) {
      console.log("Error loading notifications:", err);
    }
  };

  // ── Load doctors ──
  useEffect(() => {
    axios.get(`${BASE_URL}/auth/doctors`).then(r => setDoctors(r.data)).catch(console.log);
  }, []);

  // ── Load appointments ──
  const loadAppointments = async () => {
    try { const r = await axios.get(`${BASE_URL}/appointments/patient/${patientId}`); setAppointments(r.data); }
    catch(e) { console.log(e); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    if (patientId) {
      loadAppointments(); 
      loadReminders();
      loadVitals();
      loadNotifications();
    }
  }, [patientId]);

  // ── Book appointment ──
  const handleBook = async () => {
    if (!enquiry.trim()) { alert("Please enter your enquiry."); return; }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/appointments/book/${patientId}/${selectedDoc.id}`, { enquiry });
      alert("Appointment submitted successfully! Your doctor has been notified.");
      setSelectedDoc(null); setEnquiry(""); loadAppointments();
    } catch { alert("Error booking appointment. Please try again."); }
    finally { setLoading(false); }
  };

  // ── Log Vitals ──
  const handleLogVitals = async (e) => {
    e.preventDefault();
    if (!vitalsForm.systolic || !vitalsForm.diastolic || !vitalsForm.heartRate || !vitalsForm.bloodSugar || !vitalsForm.weight) {
      alert("Please fill in all vitals fields.");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/vitals/patient/${patientId}`, {
        systolic: Number(vitalsForm.systolic),
        diastolic: Number(vitalsForm.diastolic),
        heartRate: Number(vitalsForm.heartRate),
        bloodSugar: Number(vitalsForm.bloodSugar),
        weight: Number(vitalsForm.weight)
      });
      alert("✅ Health vitals logged successfully!");
      setVitalsForm({ systolic: "", diastolic: "", heartRate: "", bloodSugar: "", weight: "" });
      await loadVitals();
      await loadNotifications();
    } catch(err) {
      alert("Error logging vitals. Please check connection.");
    } finally {
      setLoading(false);
    }
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

  // ── Reminder checker ──
  useEffect(() => {
    const check = () => {
      const now  = new Date();
      const hhmm = now.toTimeString().slice(0,5);
      const day  = now.toLocaleDateString("en-US", { weekday:"long" });
      reminders.forEach(r => {
        if (!r.active) return;
        const ok = r.frequency==="daily" || (r.frequency==="weekdays" && !["Saturday","Sunday"].includes(day)) || (r.frequency==="weekends" && ["Saturday","Sunday"].includes(day)) || r.frequency==="once";
        if (!ok) return;
        (r.times||[]).forEach(t => {
          if (t!==hhmm) return;
          const key = `fired_${r.id}_${now.toDateString()}_${t}`;
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key,"1");
          if (r.sound!==false) playAlarm();
          setToast({ medicineName:r.medicineName, notes:r.notes });
          setTimeout(() => setToast(null), 10000);
          if (Notification.permission==="granted") new Notification("💊 Medicine Reminder — MedQRate", { body:`Time to take: ${r.medicineName}` });
          if (r.frequency==="once") {
            // Locally disable it
            setReminders(prev => prev.map(x => x.id===r.id ? {...x,active:false}:x));
          }
        });
      });
    };
    intervalRef.current = setInterval(check, 30000);
    check();
    return () => clearInterval(intervalRef.current);
  }, [reminders]);

  const addTimeSlot    = ()    => reminderForm.times.length<6 && setReminderForm(f => ({...f, times:[...f.times,""]}));
  const removeTimeSlot = (i)   => reminderForm.times.length>1 && setReminderForm(f => ({...f, times:f.times.filter((_,j)=>j!==i)}));
  const changeTime     = (i,v) => { const t=[...reminderForm.times]; t[i]=v; setReminderForm(f=>({...f,times:t})); };

  // ── Add Reminder (POSTs to Backend) ──
  const handleAddReminder = async () => {
    const vt = reminderForm.times.filter(t=>t.trim());
    if (!reminderForm.medicineName.trim()||!vt.length) { alert("Enter medicine name and at least one time."); return; }
    try {
      await axios.post(`${BASE_URL}/reminders/patient/${patientId}`, {
        name: reminderForm.medicineName,
        dosage: reminderForm.notes || "1 dose",
        timing: vt,
        frequency: reminderForm.frequency,
        startDate: new Date().toISOString().split("T")[0]
      });
      await loadReminders();
      setReminderForm(emptyForm);
      setShowReminderForm(false);
      alert("✅ Medicine Reminder Scheduled!");
    } catch(err) {
      alert("Error scheduling reminder in backend database.");
    }
  };

  // ── Delete Reminder ──
  const handleDeleteReminder = async (remId) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await axios.delete(`${BASE_URL}/reminders/${remId}`);
      await loadReminders();
    } catch(err) {
      alert("Error deleting reminder.");
    }
  };

  // ── Toggle Reminder Status (Taken log for today) ──
  const handleToggleReminderTaken = async (r) => {
    const today = new Date().toISOString().split("T")[0];
    const isTaken = r.logs?.[today] === "TAKEN";
    const nextStatus = isTaken ? "PENDING" : "TAKEN";
    try {
      await axios.put(`${BASE_URL}/reminders/toggle/${r.id}`, {
        date: today,
        status: nextStatus
      });
      await loadReminders();
    } catch(err) {
      console.log(err);
    }
  };

  // ── Set reminder from prescription ──
  const handleSetReminderFromAppt = (app) => {
    setReminderForm(f => ({ ...f, medicineName: `Dr. ${app.doctor?.name}'s prescription`, notes: app.enquiry || "" }));
    setShowReminderForm(true);
    document.getElementById("reminder-anchor")?.scrollIntoView({ behavior:"smooth" });
  };

  const filteredDocs = doctors.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()) || d.speciality?.toLowerCase().includes(search.toLowerCase()));
  const freqLabel    = { daily:"Every Day", weekdays:"Weekdays", weekends:"Weekends", once:"Once" };
  const freqColor    = { daily:"#0D9488",   weekdays:"#0284C7", weekends:"#D97706",   once:"#10B981" };

  // Approved prescriptions with QR image
  const approvedWithRx = appointments.filter(a => a.status==="APPROVED" && a.imagePath);
  const unreadNotifications = notifications.filter(n => !n.read);

  // Helper alerts for vitals status
  const getVitalAlertClass = (sys, dia, hr, sugar) => {
    let warn = [];
    if (sys > 140 || dia > 90) warn.push("High BP");
    if (sys < 90 || dia < 60) warn.push("Low BP");
    if (hr > 100) warn.push("High HR");
    if (hr < 55) warn.push("Low HR");
    if (sugar > 180) warn.push("High Sugar");
    if (sugar < 70) warn.push("Low Sugar");

    if (warn.length > 0) return { text: warn.join(", "), badge: "bg-danger text-white" };
    return { text: "Normal", badge: "bg-success text-white" };
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        /* ── NAVBAR ── */
        .p-navbar {
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

        /* ── CARDS ── */
        .sec-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
          margin-bottom: 24px;
        }
        .sec-title {
          font-size: 19px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── DOCTOR CARD ── */
        .doc-card {
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .doc-card:hover {
          border-color: #99F6E4;
          box-shadow: 0 6px 16px -2px rgba(13, 148, 136, 0.08);
          transform: translateY(-2px);
        }
        .doc-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #F0FDFA;
          border: 1px solid #CCFBF1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .btn-book {
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-book:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        /* ── APPOINTMENT CARD ── */
        .appt-card {
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          border-left: 4px solid #0D9488;
          background: #FFFFFF;
          padding: 16px 20px;
          margin-bottom: 12px;
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

        /* ── PRESCRIPTION CARD ── */
        .rx-appt-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 12px;
          border-left: 4px solid #10B981;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        /* ── REMINDERS ── */
        .rem-wrap {
          background: #FFFFFF;
          border-radius: 18px;
          padding: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
        }
        .rem-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px 18px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 4px solid #0D9488;
          transition: transform 0.2s ease;
        }
        .rem-card:hover {
          transform: translateX(3px);
          border-color: #CBD5E1;
        }
        .rem-card.off {
          opacity: 0.55;
          border-left-color: #94A3B8;
        }
        .add-btn {
          background: linear-gradient(135deg, #0D9488 0%, #0284C7 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }
        .time-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }
        .time-row input[type=time] {
          flex: 1;
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
        }
        .add-time-btn {
          border: 1.5px dashed #0D9488;
          background: transparent;
          color: #0D9488;
          border-radius: 8px;
          padding: 6px 14px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12.5px;
        }
        .toggle {
          width: 44px;
          height: 24px;
          border-radius: 50px;
          background: #CBD5E1;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.25s;
          flex-shrink: 0;
        }
        .toggle.on {
          background: #0D9488;
        }
        .toggle::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: left 0.25s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .toggle.on::after {
          left: 23px;
        }
        .notif-bar {
          background: #FFFBEB;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 14px;
          border: 1px solid #FDE68A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13.5px;
          color: #92400E;
        }

        /* ── TOAST ── */
        .toast-pop {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 9999;
          min-width: 320px;
          background: #0F172A;
          color: white;
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.35s ease;
          border-left: 4px solid #10B981;
        }
        @keyframes slideIn {
          from { transform: translateX(110%); }
          to { transform: translateX(0); }
        }

        /* ── MODAL ── */
        .rx-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          backdrop-filter: blur(3px);
        }
        .rx-modal {
          background: white;
          border-radius: 20px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          text-align: center;
        }
      `}</style>

      {/* ── TOAST ALERT ── */}
      {toast && (
        <div className="toast-pop">
          <div className="d-flex gap-3 align-items-start">
            <span style={{ fontSize: 26 }}>💊</span>
            <div>
              <div className="fw-bold" style={{ fontSize: 14.5 }}>Time to take your medication</div>
              <div style={{ color: "#38BDF8" }}>{toast.medicineName}</div>
              {toast.notes && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{toast.notes}</div>}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ marginTop: 12, width: "100%", background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 6, padding: "5px", fontWeight: 600, cursor: "pointer", fontSize: 12 }}
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* ── PRESCRIPTION QR MODAL ── */}
      {viewingRx && (
        <div className="rx-modal-overlay" onClick={() => setViewingRx(null)}>
          <div className="rx-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🩺</div>
            <h5 className="fw-bold mb-1" style={{ color: "#0F172A" }}>Digital QR Prescription</h5>
            <p className="text-muted mb-3" style={{ fontSize: 13 }}>Issued by Dr. {viewingRx.doctor?.name}</p>

            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 14, marginBottom: 16, border: "1px solid #E2E8F0" }}>
              <img
                src={viewingRx.imagePath}
                alt="Prescription QR"
                style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 8, objectFit: "contain" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>

            <div style={{ background: "#F0FDFA", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "#0F766E", marginBottom: 18, textAlign: "left", border: "1px solid #CCFBF1" }}>
              💡 <strong>Instructions:</strong> Save or scan this QR image. Prescription details and dosage schedule are securely encoded inside.
            </div>

            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button
                className="btn btn-primary-medical"
                style={{ padding: "8px 18px", fontSize: "13.5px" }}
                onClick={() => handleSetReminderFromAppt(viewingRx)}
              >
                ⏰ Set Medication Reminder
              </button>
              <button
                className="btn btn-light"
                style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "8px 16px", fontSize: "13.5px", fontWeight: 600 }}
                onClick={() => setViewingRx(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="navbar px-4 px-md-5 py-3 p-navbar">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-icon-badge">🩺</div>
          <div>
            <h5 className="fw-bold mb-0" style={{ color: "#0F172A", fontSize: "18px" }}>
              Med<span style={{ color: "#0D9488" }}>QRate</span>
            </h5>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Patient Health Portal</div>
          </div>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="user-pill d-none d-md-flex">
            <span style={{ fontSize: "16px" }}>👤</span>
            <div style={{ fontSize: "13px" }}>
              <strong>{user?.name || "Patient"}</strong>
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

        {/* ── SEARCH DOCTORS ── */}
        <div className="sec-card">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h5 className="sec-title mb-0">👨‍⚕️ Find a Specialist Doctor</h5>
            <span style={{ fontSize: "13px", color: "#64748B" }}>{filteredDocs.length} doctors available</span>
          </div>

          <input
            type="text"
            className="form-control mb-4"
            style={{ padding: "12px 16px", borderRadius: "10px" }}
            placeholder="🔍 Search doctor by name or speciality (e.g. Cardiologist)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="row g-3">
            {filteredDocs.map(doc => (
              <div className="col-md-6" key={doc.id}>
                <div className="doc-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="doc-avatar">👨‍⚕️</div>
                    <div style={{ flex: 1 }}>
                      <div className="fw-bold text-slate-900" style={{ fontSize: "15px" }}>Dr. {doc.name}</div>
                      <div style={{ fontSize: "12.5px", color: "#0D9488", fontWeight: 600 }}>{doc.speciality || "General Practitioner"}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>📍 {doc.address || "Pune, MH"}</div>
                    </div>
                    <button className="btn-book" onClick={() => setSelectedDoc(doc)}>
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredDocs.length === 0 && (
              <div className="text-center py-4 text-muted">
                No matching doctors found. Try clearing your search keyword.
              </div>
            )}
          </div>
        </div>

        {/* ── BOOK CONSULTATION FORM (CONDITIONAL) ── */}
        {selectedDoc && (
          <div className="sec-card" style={{ border: "2px solid #0D9488", backgroundColor: "#F0FDFA" }}>
            <h5 className="sec-title" style={{ color: "#0F766E" }}>
              📅 Schedule Consultation with Dr. {selectedDoc.name}
            </h5>
            <p className="text-muted" style={{ fontSize: "13px", marginTop: "-10px", marginBottom: "14px" }}>
              {selectedDoc.speciality} • {selectedDoc.qualification || "MD"}
            </p>
            <label className="form-label fw-semibold" style={{ fontSize: "13.5px" }}>Symptoms / Reason for Visit *</label>
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Describe your current health complaints, symptoms, or enquiry..."
              value={enquiry}
              onChange={e => setEnquiry(e.target.value)}
            />
            <div className="d-flex gap-2">
              <button
                className="btn-primary-medical"
                style={{ padding: "8px 22px", fontSize: "14px" }}
                onClick={handleBook}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Confirm & Send Request"}
              </button>
              <button
                className="btn btn-light"
                style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "8px 16px", fontSize: "14px" }}
                onClick={() => setSelectedDoc(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── MY APPOINTMENTS ── */}
        <div className="sec-card">
          <h5 className="sec-title">📋 Consultation History & Requests</h5>
          {appointments.length === 0 && (
            <div className="text-center py-4 text-muted" style={{ fontSize: "14px" }}>
              No consultation requests yet. Find a doctor above to request an appointment.
            </div>
          )}
          {appointments.map(app => (
            <div key={app.id} className="appt-card">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-bold" style={{ fontSize: "15px", color: "#0F172A" }}>
                    Dr. {app.doctor?.name}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#64748B" }}>
                    Enquiry: {app.enquiry}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {app.status === "PENDING" && (
                    <span className="badge-pending">⏳ Pending Review</span>
                  )}
                  {app.status === "APPROVED" && (
                    <span className="badge-approved">✅ Approved</span>
                  )}
                  {app.status === "APPROVED" && app.imagePath && (
                    <button
                      className="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold"
                      onClick={() => setViewingRx(app)}
                    >
                      📲 View QR Prescription
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MY PRESCRIPTION QRS ── */}
        <div className="sec-card" style={{ borderLeft: "4px solid #10B981" }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <div>
              <h5 className="sec-title mb-0" style={{ color: "#065F46" }}>
                💊 Verified Digital Prescriptions
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                Digital prescriptions issued by your attending physicians
              </p>
            </div>
            <span className="badge-approved">{approvedWithRx.length} Available</span>
          </div>

          <div className="mt-3">
            {approvedWithRx.length === 0 ? (
              <div className="text-center py-4 text-muted" style={{ fontSize: "14px" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                No active prescriptions received yet.<br />
                Once your doctor approves an appointment and attaches a prescription, it will appear here.
              </div>
            ) : (
              approvedWithRx.map(app => (
                <div key={app.id} className="rx-appt-card">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 44, height: 44, background: "#ECFDF5", color: "#10B981", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        🩺
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: "#0F172A", fontSize: "14.5px" }}>
                          Dr. {app.doctor?.name}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748B" }}>
                          Condition: {app.enquiry}
                        </div>
                        <span className="badge-approved mt-1" style={{ display: "inline-block" }}>
                          Prescription Ready
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold"
                        onClick={() => setViewingRx(app)}
                      >
                        📲 View QR
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                        onClick={() => handleSetReminderFromAppt(app)}
                      >
                        ⏰ Add Alarm
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── MEDICINE REMINDERS ── */}
        <div className="rem-wrap" id="reminder-anchor">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h5 className="sec-title mb-0">⏰ Smart Medication Schedule</h5>
              <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                Keep your pill intake disciplined with audio chimes and browser alerts
              </p>
            </div>
            <button className="add-btn" onClick={() => setShowReminderForm(!showReminderForm)}>
              {showReminderForm ? "✕ Close Form" : "+ Add Reminder"}
            </button>
          </div>

          {notifPerm !== "granted" && (
            <div className="notif-bar">
              <span>🔔 Enable browser notifications to get alerts even when this tab is not active</span>
              <button
                className="btn btn-sm btn-warning fw-bold px-3"
                style={{ borderRadius: "6px" }}
                onClick={async () => { const r = await Notification.requestPermission(); setNotifPerm(r); }}
              >
                Enable
              </button>
            </div>
          )}

          {/* Form */}
          {showReminderForm && (
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 20, border: "1px solid #E2E8F0", marginBottom: 20 }}>
              <h6 className="fw-bold mb-3" style={{ color: "#0F172A" }}>New Medicine Alarm</h6>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Medicine Name *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Amoxicillin 500mg, Metformin"
                  value={reminderForm.medicineName}
                  onChange={e => setReminderForm(f => ({ ...f, medicineName: e.target.value }))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Dose Time(s) * (Up to 6 times per day)</label>
                {reminderForm.times.map((t, i) => (
                  <div className="time-row" key={i}>
                    <input type="time" value={t} onChange={e => changeTime(i, e.target.value)} />
                    <button
                      className="btn btn-sm btn-outline-danger"
                      style={{ borderRadius: "8px", padding: "6px 12px" }}
                      onClick={() => removeTimeSlot(i)}
                      disabled={reminderForm.times.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {reminderForm.times.length < 6 && (
                  <button className="add-time-btn" onClick={addTimeSlot}>+ Add Another Slot</button>
                )}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Intake Frequency</label>
                  <select
                    className="form-select"
                    value={reminderForm.frequency}
                    onChange={e => setReminderForm(f => ({ ...f, frequency: e.target.value }))}
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekdays">Weekdays (Mon – Fri)</option>
                    <option value="weekends">Weekends (Sat – Sun)</option>
                    <option value="once">Once (Today Only)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Doctor Instructions / Notes</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Take 30 mins after meal"
                    value={reminderForm.notes}
                    onChange={e => setReminderForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={reminderForm.sound}
                    onChange={e => setReminderForm(f => ({ ...f, sound: e.target.checked }))}
                  />
                  <span>🔊 Play sound alarm at scheduled times</span>
                </label>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button className="btn-primary-medical" style={{ padding: "8px 20px" }} onClick={handleAddReminder}>
                  💾 Save Schedule
                </button>
                <button
                  className="btn btn-light"
                  style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "8px 16px" }}
                  onClick={() => { setShowReminderForm(false); setReminderForm(emptyForm); }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-outline-success ms-auto"
                  style={{ borderRadius: "8px", padding: "8px 16px" }}
                  onClick={playAlarm}
                >
                  🔔 Test Synthesizer Sound
                </button>
              </div>
            </div>

          {/* Reminder List */}
          <div className="mt-2">
            {reminders.length === 0 ? (
              <div className="text-center py-4 text-muted" style={{ fontSize: "14px" }}>
                No medicine schedules configured yet. Click <strong>"+ Add Reminder"</strong> to configure alarms.
              </div>
            ) : (
              reminders.map(r => (
                <div key={r.id} className={`rem-card ${!r.active ? "off" : ""}`}>
                  <div className="d-flex align-items-start gap-3" style={{ flex: 1 }}>
                    <span style={{ fontSize: 24, marginTop: 2 }}>💊</span>
                    <div>
                      <div className="fw-bold text-slate-900" style={{ fontSize: 14.5 }}>{r.medicineName}</div>
                      <div className="mt-1 d-flex flex-wrap gap-1">
                        {(r.times || []).map((t, i) => (
                          <span
                            key={i}
                            style={{ background: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}
                          >
                            🕐 {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1 d-flex align-items-center gap-2 flex-wrap">
                        <span style={{ background: freqColor[r.frequency] || "#0D9488", color: "white", borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                          {freqLabel[r.frequency]}
                        </span>
                        {r.sound !== false ? (
                          <span style={{ fontSize: 12, color: "#64748B" }}>🔊 Sound On</span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>🔇 Muted</span>
                        )}
                        {r.notes && (
                          <span style={{ fontSize: 12, color: "#64748B" }}>📝 {r.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className={`toggle ${r.active ? "on" : ""}`}
                      onClick={() => setReminders(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))}
                    />
                    <button
                      className="btn btn-outline-danger btn-sm"
                      style={{ borderRadius: "8px", padding: "4px 10px" }}
                      onClick={() => setReminders(prev => prev.filter(x => x.id !== r.id))}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0F172A", color: "#94A3B8", padding: "30px 20px 20px", marginTop: "auto" }}>
        <div className="container" style={{ maxWidth: "1080px" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="fw-bold text-white" style={{ fontSize: "15px" }}>🩺 MedQRate Patient Hub</div>
              <div style={{ fontSize: "12px", color: "#64748B" }}>Smart Healthcare Appointment & Prescription Management</div>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>
              Support: support@medqrate.com | Emergency: 108
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

export default PatientHome;
