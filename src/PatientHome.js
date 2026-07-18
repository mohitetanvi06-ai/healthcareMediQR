import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import QRScanner from "./QRScanner";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// ── Alarm sound ──
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
      alert("🎉 Appointment submitted successfully!");
      setSelectedDoc(null); setEnquiry(""); loadAppointments();
      loadNotifications(); // Refresh notifications
    } catch { alert("Error booking appointment."); }
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

  // ── QR Scan Decoded ──
  const handleQRDecoded = (text) => {
    const lines = text.split("\n");
    const parsed = {};
    lines.forEach(l => {
      const idx = l.indexOf(":");
      if (idx !== -1) {
        const key = l.substring(0, idx).trim().toLowerCase();
        const val = l.substring(idx + 1).trim();
        parsed[key] = val;
      }
    });

    if (!text.includes("MedQRate Prescription")) {
      alert("Invalid QR Code structure. Make sure you scan a valid MedQRate Prescription QR.");
      return;
    }

    setScannedRx({
      raw: text,
      patientName: parsed["patient"] || "",
      doctorName: parsed["doctor"] || "",
      medicine: parsed["medicine"] || "",
      dosage: parsed["dosage"] || "",
      frequency: parsed["frequency"] || "",
      duration: parsed["duration"] || "",
      instructions: parsed["instructions"] || "",
      date: parsed["date"] || ""
    });
  };

  // ── Import Scanned QR prescription into reminder form ──
  const handleSetReminderFromScannedRx = () => {
    if (!scannedRx) return;
    setReminderForm({
      medicineName: scannedRx.medicine,
      times: ["08:00"],
      frequency: "daily",
      notes: `${scannedRx.dosage} - ${scannedRx.instructions} (from Dr. ${scannedRx.doctorName})`,
      sound: true
    });
    setScannedRx(null);
    setShowReminderForm(true);
    document.getElementById("reminder-anchor")?.scrollIntoView({ behavior:"smooth" });
  };

  const filteredDocs = doctors.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));
  const freqLabel    = { daily:"Every Day", weekdays:"Weekdays", weekends:"Weekends", once:"Once" };
  const freqColor    = { daily:"#a855f7",   weekdays:"#3b82f6", weekends:"#e67e22",   once:"#2ecc71" };

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
    <>
      <style>{`
        .p-navbar {
          background: rgba(20, 10, 45, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 99;
        }
        .sec-card {
          background: rgba(30, 20, 50, 0.4);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          padding: 26px;
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
        .doc-card {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.02);
        }
        .doc-card:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.05);
          border-color: rgba(168,85,247,0.3);
        }
        .appt-card {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          border-left: 4px solid #a855f7;
          background: rgba(255,255,255,0.02);
        }
        /* Prescription QR cards */
        .rx-appt-card {
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          border-left: 5px solid #2ecc71;
          margin-bottom: 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          animation: fadeUp 0.3s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        
        /* QR Modal */
        .rx-modal-overlay {
          position:fixed; inset:0; background:rgba(10,5,25,0.8);
          display:flex; align-items:center; justify-content:center;
          z-index:9999; padding:20px; backdrop-filter:blur(6px);
        }
        .rx-modal {
          background:rgba(30,20,50,0.95);
          border-radius:24px; padding:30px; max-width:440px; width:100%;
          box-shadow:0 20px 60px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          animation:fadeUp 0.3s ease;
          text-align:center;
          color: white;
        }
        /* Reminder */
        .rem-wrap {
          background: rgba(30, 20, 50, 0.4);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          padding: 26px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 8px 32px rgba(168, 85, 247, 0.05);
        }
        .rem-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-left: 4px solid #a855f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: transform 0.2s;
        }
        .rem-card:hover { transform: translateX(4px); background: rgba(255,255,255,0.05); }
        .rem-card.off  { opacity: 0.4; border-left-color: rgba(255,255,255,0.2); }
        .add-btn {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white; border: none; border-radius: 50px;
          padding: 10px 24px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 12px rgba(168,85,247,0.3);
          transition: all 0.2s;
        }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(168,85,247,0.5); }
        .time-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
        .time-row input[type=time] {
          flex:1; border:1.5px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2); color: white;
          border-radius:12px; padding:8px 14px; font-size:15px;
        }
        .time-row input[type=time]:focus { border-color:#a855f7; outline:none; }
        .add-time-btn {
          border:2px dashed rgba(168, 85, 247, 0.4); background:transparent;
          color:#d8b4fe; border-radius:50px; padding:7px 18px;
          font-weight:600; cursor:pointer; font-size:13px; transition: all 0.2s;
        }
        .add-time-btn:hover { background: rgba(168, 85, 247, 0.1); }
        .toggle { width:46px; height:24px; border-radius:50px; background:rgba(255,255,255,0.1); border:none; cursor:pointer; position:relative; transition:background 0.3s; flex-shrink:0; }
        .toggle.on { background:#a855f7; }
        .toggle::after { content:''; position:absolute; width:18px; height:18px; background:white; border-radius:50%; top:3px; left:3px; transition:left 0.3s; }
        .toggle.on::after { left:25px; }
        
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

        .toast-pop {
          position:fixed; top:80px; right:20px; z-index:9999; min-width:320px;
          background:linear-gradient(135deg,#a855f7,#3b82f6); color:white;
          border-radius:18px; padding:18px 20px;
          box-shadow:0 10px 40px rgba(168,85,247,0.4); animation:slideIn 0.4s ease;
        }
        @keyframes slideIn { from{transform:translateX(120%)} to{transform:translateX(0)} }
        
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
      `}</style>

      {/* ── TOAST ALERT ── */}
      {toast && (
        <div className="toast-pop">
          <div className="d-flex gap-3 align-items-start">
            <span style={{ fontSize:30 }}>💊</span>
            <div>
              <div className="fw-bold" style={{ fontSize:15 }}>Time to take your medicine!</div>
              <div>{toast.medicineName}</div>
              {toast.notes && <div style={{ fontSize:12, opacity:0.85 }}>{toast.notes}</div>}
            </div>
          </div>
          <button onClick={()=>setToast(null)} style={{ marginTop:10,width:"100%",background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:5,fontWeight:600,cursor:"pointer" }}>✓ Dismiss</button>
        </div>
      )}

      {/* ── PRESCRIPTION QR MODAL ── */}
      {viewingRx && (
        <div className="rx-modal-overlay" onClick={()=>setViewingRx(null)}>
          <div className="rx-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:8 }}>🩺</div>
            <h5 className="fw-bold mb-1" style={{ color:"#d8b4fe" }}>Your Prescription</h5>
            <p className="text-muted mb-3" style={{ fontSize:13 }}>From Dr. {viewingRx.doctor?.name}</p>

            <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:14, padding:16, marginBottom:18, border: "1px solid rgba(255,255,255,0.06)" }}>
              <img src={viewingRx.imagePath} alt="Prescription QR"
                style={{ maxWidth:"100%", maxHeight:300, borderRadius:10, objectFit:"contain" }}
                onError={e=>{ e.target.style.display="none"; }} />
            </div>

            <div style={{ background:"rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#5cd699", marginBottom:16, textAlign:"left" }}>
              <strong>📋 How to use:</strong> Save this QR image → your doctor's prescription info is encoded inside it.
            </div>

            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button className="btn btn-primary rounded-pill px-4" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none" }} onClick={()=>handleSetReminderFromAppt(viewingRx)}>
                ⏰ Set Medicine Reminder
              </button>
              <button className="btn btn-outline-light rounded-pill" onClick={()=>setViewingRx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCANNED RX PREVIEW MODAL ── */}
      {scannedRx && (
        <div className="rx-modal-overlay" onClick={()=>setScannedRx(null)}>
          <div className="rx-modal" style={{ maxWidth: "500px" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
            <h5 className="fw-bold mb-1" style={{ color:"#d8b4fe" }}>Scanned Prescription QR</h5>
            <p className="text-muted mb-3" style={{ fontSize:13 }}>Details decoded successfully</p>

            <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:14, padding:16, marginBottom:18, border: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: "14px" }}>
              <div className="row g-2">
                <div className="col-4 fw-bold text-muted">Doctor:</div>
                <div className="col-8">Dr. {scannedRx.doctorName}</div>
                <div className="col-4 fw-bold text-muted">Patient:</div>
                <div className="col-8">{scannedRx.patientName}</div>
                <div className="col-4 fw-bold text-muted">Medicine:</div>
                <div className="col-8 text-info fw-bold">{scannedRx.medicine}</div>
                <div className="col-4 fw-bold text-muted">Dosage:</div>
                <div className="col-8">{scannedRx.dosage}</div>
                <div className="col-4 fw-bold text-muted">Frequency:</div>
                <div className="col-8">{scannedRx.frequency}</div>
                <div className="col-4 fw-bold text-muted">Duration:</div>
                <div className="col-8">{scannedRx.duration}</div>
                <div className="col-4 fw-bold text-muted">Instructions:</div>
                <div className="col-8">{scannedRx.instructions}</div>
                <div className="col-4 fw-bold text-muted">Date:</div>
                <div className="col-8">{scannedRx.date}</div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button className="btn btn-primary rounded-pill px-4" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none" }} onClick={handleSetReminderFromScannedRx}>
                ⏰ Set Reminder Alarm
              </button>
              <button className="btn btn-outline-light rounded-pill" onClick={()=>setScannedRx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS DRAWER ── */}
      {showNotifDrawer && (
        <div className="notif-drawer-overlay" onClick={()=>setShowNotifDrawer(false)}>
          <div className="notif-drawer" onClick={e=>e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">🔔 Notifications</h5>
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
                  <p className="mt-2">No notifications yet.</p>
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
      <nav className="navbar navbar-expand-lg px-4 px-md-5 py-3 p-navbar">
        <div className="d-flex align-items-center">
          <span style={{ fontSize:28, marginRight:10 }}>🏥</span>
          <div>
            <h5 className="fw-bold text-white mb-0">MedQRate</h5>
            <div style={{ fontSize:11, color:"#d4b8ff" }}>Patient Dashboard</div>
          </div>
        </div>
        
        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Notifications Bell */}
          <button className="bell-btn" onClick={() => setShowNotifDrawer(true)}>
            <span>🔔</span>
            {unreadNotifications.length > 0 && (
              <span className="badge-count">{unreadNotifications.length}</span>
            )}
          </button>

          <div className="text-white text-end d-none d-md-block me-2">
            <div className="fw-bold">Hello, {user?.name} 👋</div>
            <div style={{ fontSize:12, opacity:0.75 }}>Patient</div>
          </div>
          
          <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={() => { localStorage.removeItem("user"); window.location="/"; }}>Logout</button>
        </div>
      </nav>

      {/* ── QR CODE CAMERA SCAN TRIGGER CARD ── */}
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-12">
            <div className="sec-card d-flex flex-column flex-md-row align-items-center justify-content-between gap-4" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))", borderColor: "rgba(168,85,247,0.3)" }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: 44 }}>📲</div>
                <div>
                  <h4 className="fw-bold mb-1">Scan Your Medicine QR</h4>
                  <p className="text-muted mb-0" style={{ fontSize: 13, color: "#ccc" }}>Got a QR prescription code from your doctor? Scan or upload it here to import medicine alarms instantly.</p>
                </div>
              </div>
              <button className="add-btn text-nowrap" style={{ padding: "12px 28px" }} onClick={() => setShowScanner(true)}>
                📷 Open Scanner
              </button>
            </div>
          </div>
        </div>

        {/* ── QR SCANNER OVERLAY MODAL ── */}
        {showScanner && (
          <QRScanner onScanSuccess={handleQRDecoded} onClose={() => setShowScanner(false)} />
        )}

        <div className="row g-4">
          {/* ── SEARCH & BOOK DOCTORS ── */}
          <div className="col-lg-7">
            <div className="sec-card">
              <h5 className="fw-bold mb-3">👨‍⚕️ Find a Doctor</h5>
              <input type="text" className="form-control rounded-pill p-3 mb-4"
                placeholder="🔍 Search doctor by name..." value={search} onChange={e=>setSearch(e.target.value)} />
              <div className="row g-3" style={{ maxHeight: "400px", overflowY: "auto", padding: "2px" }}>
                {filteredDocs.map(doc => (
                  <div className="col-12" key={doc.id}>
                    <div className="doc-card card p-3">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width:45, height:45, borderRadius:"12px", background:"linear-gradient(135deg,#a855f7,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🩺</div>
                        <div style={{ flex:1 }}>
                          <div className="fw-bold">{doc.name}</div>
                          <div className="text-muted" style={{ fontSize:12 }}>{doc.speciality} • {doc.address}</div>
                        </div>
                        <button className="btn btn-primary btn-sm rounded-pill px-3" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none" }} onClick={()=>setSelectedDoc(doc)}>Book</button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDocs.length===0 && <p className="text-muted">No doctors found.</p>}
              </div>
            </div>

            {/* ── BOOK APPOINTMENT SYMPTOMS ── */}
            {selectedDoc && (
              <div className="sec-card" style={{ border:"2px solid #a855f7" }}>
                <h5 className="fw-bold mb-3 text-white">📅 Book Appointment with Dr. {selectedDoc.name}</h5>
                <textarea className="form-control mb-3 rounded-3" rows={3} placeholder="Describe your symptoms or enquiry..."
                  value={enquiry} onChange={e=>setEnquiry(e.target.value)} />
                <div className="d-flex gap-2">
                  <button className="btn btn-success rounded-pill px-4" onClick={handleBook} disabled={loading}>{loading?"⏳ Submitting...":"✅ Submit"}</button>
                  <button className="btn btn-outline-light rounded-pill" onClick={()=>setSelectedDoc(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* ── MY APPOINTMENTS STATUS ── */}
            <div className="sec-card">
              <h5 className="fw-bold mb-3">📅 My Appointments</h5>
              {appointments.length===0 && <p className="text-muted">No appointments yet.</p>}
              <div style={{ maxHeight: "250px", overflowY: "auto", padding: "2px" }}>
                {appointments.map(app => (
                  <div key={app.id} className="appt-card card p-3 mb-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <div className="fw-bold">Dr. {app.doctor?.name}</div>
                        <div className="text-muted" style={{ fontSize:13 }}>📝 {app.enquiry}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {app.status==="PENDING" && <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">⏳ Pending</span>}
                        {app.status==="APPROVED" && !app.imagePath && <span className="badge bg-success px-3 py-2 rounded-pill">✅ Approved</span>}
                        {app.status==="APPROVED" && app.imagePath && (
                          <button className="btn btn-success btn-sm rounded-pill" style={{ background: "#2ecc71", border: "none" }} onClick={()=>setViewingRx(app)}>
                            📲 View Prescription QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── VITALS LOGGING & TRACKER (NEW COMPONENT) ── */}
          <div className="col-lg-5">
            <div className="sec-card">
              <h5 className="fw-bold mb-3">📈 Log Your Health Vitals</h5>
              <form onSubmit={handleLogVitals}>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-muted mb-1" style={{ fontSize:12 }}>Systolic BP (mmHg)</label>
                    <input type="number" className="form-control" placeholder="e.g. 120" value={vitalsForm.systolic} onChange={e=>setVitalsForm({...vitalsForm, systolic:e.target.value})} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1" style={{ fontSize:12 }}>Diastolic BP (mmHg)</label>
                    <input type="number" className="form-control" placeholder="e.g. 80" value={vitalsForm.diastolic} onChange={e=>setVitalsForm({...vitalsForm, diastolic:e.target.value})} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1" style={{ fontSize:12 }}>Heart Rate (bpm)</label>
                    <input type="number" className="form-control" placeholder="e.g. 72" value={vitalsForm.heartRate} onChange={e=>setVitalsForm({...vitalsForm, heartRate:e.target.value})} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1" style={{ fontSize:12 }}>Blood Sugar (mg/dL)</label>
                    <input type="number" className="form-control" placeholder="e.g. 100" value={vitalsForm.bloodSugar} onChange={e=>setVitalsForm({...vitalsForm, bloodSugar:e.target.value})} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted mb-1" style={{ fontSize:12 }}>Weight (kg)</label>
                    <input type="number" className="form-control" placeholder="e.g. 70" value={vitalsForm.weight} onChange={e=>setVitalsForm({...vitalsForm, weight:e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="add-btn w-100" disabled={loading}>
                  {loading ? "Logging..." : "💾 Save Vitals"}
                </button>
              </form>

              {/* Vitals History List */}
              <h6 className="fw-bold mt-4 mb-2">Vitals Log History</h6>
              <div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "12px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px" }}>
                {vitals.length === 0 ? (
                  <p className="text-muted text-center py-3 mb-0">No vitals logged yet.</p>
                ) : (
                  [...vitals].reverse().map(v => {
                    const alertCheck = getVitalAlertClass(v.systolic, v.diastolic, v.heartRate, v.bloodSugar);
                    return (
                      <div key={v.id} className="p-2 border-bottom border-secondary mb-1">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold text-info">{new Date(v.timestamp).toLocaleDateString()}</span>
                          <span className={`badge ${alertCheck.badge}`}>{alertCheck.text}</span>
                        </div>
                        <div className="row g-1 text-white-50" style={{ fontSize: "11px" }}>
                          <div className="col-6">BP: {v.systolic}/{v.diastolic} mmHg</div>
                          <div className="col-6">Heart Rate: {v.heartRate} bpm</div>
                          <div className="col-6">Sugar: {v.bloodSugar} mg/dL</div>
                          <div className="col-6">Weight: {v.weight} kg</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MY PRESCRIPTION QRs RECEIVED DIRECTLY FROM APPOINTMENTS ── */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div style={{ background:"rgba(30, 20, 50, 0.4)", borderRadius:20, padding:26, border:"1px solid rgba(46,204,113,0.3)" }}>
              <h4 className="fw-bold mb-1" style={{ color:"#5cd699" }}>📋 My Appointment Prescriptions</h4>
              <p className="text-muted mb-4" style={{ fontSize:13, color: "#ccc" }}>
                Official prescription cards uploaded directly to your appointments. Click View QR to save.
              </p>

              {approvedWithRx.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div style={{ fontSize:52 }}>📭</div>
                  <p className="mt-2 text-white-50">No prescription uploads found. Once approved by a doctor, they'll show here.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {approvedWithRx.map(app => (
                    <div className="col-md-6" key={app.id}>
                      <div className="rx-appt-card">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width:48, height:48, background:"linear-gradient(135deg,#2ecc71,#1abc9c)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🩺</div>
                            <div>
                              <div className="fw-bold text-white">Dr. {app.doctor?.name}</div>
                              <div className="text-muted" style={{ fontSize:13 }}>📝 {app.enquiry}</div>
                              <span className="badge bg-success mt-1 rounded-pill">✅ Approved & Uploaded</span>
                            </div>
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-success rounded-pill px-3" style={{ background: "#2ecc71", border: "none" }} onClick={()=>setViewingRx(app)}>
                              📲 View QR
                            </button>
                            <button className="btn btn-outline-light rounded-pill px-3" onClick={()=>handleSetReminderFromAppt(app)}>
                              ⏰ Add Alarms
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MEDICINE REMINDERS & ALARMS PANEL ── */}
        <div className="row g-4 mb-5" id="reminder-anchor">
          <div className="col-12">
            <div className="rem-wrap">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                <div>
                  <h4 className="mb-0 fw-bold" style={{ color:"#d8b4fe" }}>💊 Smart Medicine Reminders</h4>
                  <p className="text-muted mb-0" style={{ fontSize:13, color: "#ccc", marginTop:4 }}>Set alarm schedules synced with your health portal. Keep dashboard open for live audible alerts.</p>
                </div>
                <button className="add-btn" onClick={()=>setShowReminderForm(!showReminderForm)}>
                  {showReminderForm ? "✕ Cancel" : "+ Add Reminder"}
                </button>
              </div>

              {notifPerm!=="granted" && (
                <div className="notif-bar" style={{ background: "rgba(255, 193, 7, 0.1)", border: "1px solid #ffc107", borderRadius: "12px", padding: "12px 16px", color: "#ffe082" }}>
                  <span>🔔 Allow notifications for background reminders</span>
                  <button className="btn btn-warning btn-sm fw-bold ms-3" onClick={async()=>{ const r=await Notification.requestPermission(); setNotifPerm(r); }}>Enable</button>
                </div>
              )}
              {notifPerm==="granted" && <div style={{ fontSize:13, color:"#2d8a2d", marginBottom:8 }}>✅ Desktop browser notifications enabled</div>}

              {/* Reminder Input Form */}
              {showReminderForm && (
                <div style={{ background:"rgba(30, 20, 50, 0.9)", borderRadius:16, padding:22, border: "1px solid rgba(255,255,255,0.08)", marginTop:16, animation:"fadeUp 0.3s ease" }}>
                  <h6 className="fw-bold mb-3 text-white">🆕 New Scheduled Reminder</h6>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-white-50">💊 Medicine Name *</label>
                    <input className="form-control" placeholder="e.g. Vitamin D3 1000IU"
                      value={reminderForm.medicineName} onChange={e=>setReminderForm(f=>({...f,medicineName:e.target.value}))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-white-50">🕐 Dose Timing Alarms * <span style={{ fontSize:12, color:"#aaa", fontWeight:400 }}>(up to 6 times a day)</span></label>
                    {reminderForm.times.map((t,i)=>(
                      <div className="time-row" key={i}>
                        <input type="time" value={t} onChange={e=>changeTime(i,e.target.value)} />
                        <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={()=>removeTimeSlot(i)} disabled={reminderForm.times.length===1}>✕</button>
                      </div>
                    ))}
                    {reminderForm.times.length<6 && <button className="add-time-btn" onClick={addTimeSlot}>+ Add Time</button>}
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-white-50">Frequency</label>
                      <select className="form-select" style={{ background: "#140a2d", color: "white", border: "1px solid rgba(255,255,255,0.1)" }} value={reminderForm.frequency} onChange={e=>setReminderForm(f=>({...f,frequency:e.target.value}))}>
                        <option value="daily">Every Day</option>
                        <option value="weekdays">Weekdays (Mon–Fri)</option>
                        <option value="weekends">Weekends (Sat–Sun)</option>
                        <option value="once">Once (Today Only)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-white-50">Dosage details / Notes</label>
                      <input className="form-control" placeholder="e.g. 1 tablet, after meal" value={reminderForm.notes} onChange={e=>setReminderForm(f=>({...f,notes:e.target.value}))} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, fontWeight:500 }}>
                      <input type="checkbox" checked={reminderForm.sound} onChange={e=>setReminderForm(f=>({...f,sound:e.target.checked}))} />
                      🔊 Play alarm alert sound
                    </label>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="add-btn" onClick={handleAddReminder}>💾 Save Reminder</button>
                    <button className="btn btn-outline-light rounded-pill" onClick={()=>{ setShowReminderForm(false); setReminderForm(emptyForm); }}>Cancel</button>
                    <button className="btn btn-outline-success rounded-pill ms-auto" onClick={playAlarm}>🔔 Test Sound</button>
                  </div>
                </div>
              )}

              {/* Active Reminders List */}
              <div className="mt-4">
                {reminders.length===0 ? (
                  <div className="text-center py-4 text-muted">
                    <div style={{ fontSize:46 }}>💊</div>
                    <p className="mt-2 text-white-50">No scheduled reminders found. Add reminders manually or scan prescription QRs.</p>
                  </div>
                ) : (
                  reminders.map(r => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const isTaken = r.logs?.[todayStr] === "TAKEN";
                    return (
                      <div key={r.id} className={`rem-card ${!r.active?"off":""}`}>
                        <div className="d-flex align-items-start gap-3" style={{ flex:1 }}>
                          <span style={{ fontSize:26 }}>💊</span>
                          <div>
                            <div className="fw-bold" style={{ fontSize:15, color: "#fff" }}>{r.medicineName}</div>
                            <div className="mt-2">
                              {(r.times||[]).map((t,i)=>(
                                <span key={i} style={{ background:"rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", color:"#d8b4fe", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600, marginRight:6 }}>🕐 {t}</span>
                              ))}
                            </div>
                            <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                              <span style={{ background: freqColor[r.frequency]||"#a855f7", color:"white", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{freqLabel[r.frequency]}</span>
                              {r.sound!==false ? <span style={{ fontSize:12, color:"#a855f7" }}>🔊 Alarm Active</span> : <span style={{ fontSize:12, color:"#777" }}>🔇 Alarm Muted</span>}
                            </div>
                            {r.notes && <div style={{ fontSize:13, color:"#ccc", marginTop:6 }}>📝 {r.notes}</div>}
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                          {/* Log Taken check button */}
                          <button className={`btn btn-sm rounded-pill px-3 text-nowrap ${isTaken ? 'btn-success' : 'btn-outline-success'}`} onClick={() => handleToggleReminderTaken(r)}>
                            {isTaken ? "✓ Taken Today" : "Mark Taken"}
                          </button>
                          
                          {/* Delete button */}
                          <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={()=>handleDeleteReminder(r.id)}>🗑</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="text-white pt-5 pb-3 border-top border-secondary" style={{ background:"#0a0518" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold text-white">🏥 MedQRate</h5>
              <p className="mt-2 text-white-50" style={{ fontSize: 13 }}>Smart Healthcare Appointment & Prescription Management.</p>
              <p style={{ fontSize: 13, color: "#ccc" }}>📍 Chinchwad, Pune, Maharashtra</p>
              <p style={{ fontSize: 13, color: "#ccc" }}>📧 healthcare@gmail.com</p>
              <p style={{ fontSize: 13, color: "#ccc" }}>📞 +91 9876543210</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold text-white">⏳ Hospital Timings</h5>
              <p className="mt-2 text-white-50" style={{ fontSize: 13 }}>Mon–Fri: 9AM–6PM</p>
              <p className="text-white-50" style={{ fontSize: 13 }}>Saturday: 9AM–2PM</p>
              <p className="text-white-50" style={{ fontSize: 13 }}>Sunday: Closed</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold text-white">📊 Connect With Us</h5>
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

export default PatientHome;