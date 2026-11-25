const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, ".env") });

let mysql = null;
try {
  mysql = require("mysql2/promise");
} catch (e) {
  mysql = null;
}

const DB_PATH = process.env.NODE_ENV === "test"
  ? path.join(__dirname, "database.test.json")
  : path.join(__dirname, "database.json");

const defaultData = {
  users: [
    {
      id: "doc1",
      name: "John Doe",
      email: "doctor@medqrate.com",
      password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", // password123
      role: "DOCTOR",
      speciality: "Cardiologist",
      qualification: "MD, DM (Cardiology)",
      address: "Chinchwad, Pune",
      phone: "9876543210"
    },
    {
      id: "pat1",
      name: "Jane Smith",
      email: "patient@medqrate.com",
      password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", // password123
      role: "PATIENT",
      dob: "1995-08-15",
      age: "30",
      address: "Aundh, Pune",
      phone: "9988776655"
    }
  ],
  appointments: [],
  reminders: [],
  vitals: [],
  notifications: []
};

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

defaultData.users[0].password = hashPassword("password123");
defaultData.users[1].password = hashPassword("password123");

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database file:", error);
    return defaultData;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// ── MySQL Connection Pool & Auto-Initialization ──
let pool = null;
let useMySQL = false;

if (process.env.NODE_ENV !== "test" && mysql) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "medqrate_db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    pool.getConnection()
      .then(async (conn) => {
        useMySQL = true;
        console.log(`🐬 [MySQL] Successfully connected to database: ${process.env.DB_NAME || "medqrate_db"}`);

        // Ensure users table exists
        await conn.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('DOCTOR', 'PATIENT') NOT NULL,
            dob DATE NULL,
            age VARCHAR(10) NULL,
            speciality VARCHAR(100) NULL,
            qualification VARCHAR(100) NULL,
            address VARCHAR(255) NULL,
            phone VARCHAR(20) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Ensure all registered users from database.json are synced into MySQL
        const localUsers = readDB().users || [];
        for (const u of localUsers) {
          try {
            await conn.execute(`
              INSERT IGNORE INTO users (id, name, email, password, role, dob, age, speciality, qualification, address, phone)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              u.id,
              u.name,
              (u.email || "").trim().toLowerCase(),
              u.password,
              u.role,
              u.dob || null,
              u.age || null,
              u.speciality || null,
              u.qualification || null,
              u.address || null,
              u.phone || null
            ]);
          } catch (e) {}
        }
        console.log(`🐬 [MySQL] Synced registered accounts into medqrate_db.`);
        conn.release();
      })
      .catch((err) => {
        useMySQL = false;
        console.log(`ℹ️ [MySQL] Connection paused (${err.code || err.message}). Operating on local store.`);
      });
  } catch (err) {
    useMySQL = false;
    console.log("ℹ️ [MySQL] Operating on local store.");
  }
}

module.exports = {
  hashPassword,
  getUsers: async () => {
    if (useMySQL && pool) {
      try {
        const [rows] = await pool.execute("SELECT * FROM users");
        if (rows && rows.length > 0) return rows;
      } catch (e) {}
    }
    return readDB().users;
  },
  saveUser: async (user) => {
    user.id = user.id || "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    user.email = (user.email || "").trim().toLowerCase();
    user.password = hashPassword(user.password);

    if (useMySQL && pool) {
      try {
        const query = `
          INSERT INTO users (id, name, email, password, role, dob, age, speciality, qualification, address, phone)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.execute(query, [
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.dob || null,
          user.age || null,
          user.speciality || null,
          user.qualification || null,
          user.address || null,
          user.phone || null
        ]);
        console.log(`✅ [MySQL] User registered successfully: ${user.email} (${user.role})`);
      } catch (err) {
        console.error("MySQL save error, syncing to file:", err.message);
      }
    }

    // Always keep local file synced for backup & instant response
    const db = readDB();
    db.users.push(user);
    writeDB(db);
    return user;
  },
  findUserByEmail: async (email) => {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    if (useMySQL && pool) {
      try {
        const [rows] = await pool.execute("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?", [clean]);
        if (rows && rows.length > 0) {
          return rows[0];
        }
      } catch (e) {}
    }
    return readDB().users.find(u => u.email && u.email.trim().toLowerCase() === clean) || null;
  },
  findUserById: (id) => {
    return readDB().users.find(u => u.id === id);
  },
  getAppointments: () => readDB().appointments,
  saveAppointment: (app) => {
    const db = readDB();
    app.id = app.id || "app_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    app.status = app.status || "PENDING";
    app.createdAt = new Date().toISOString();
    db.appointments.push(app);
    writeDB(db);
    return app;
  },
  updateAppointment: (id, updates) => {
    const db = readDB();
    const index = db.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      db.appointments[index] = { ...db.appointments[index], ...updates };
      writeDB(db);
      return db.appointments[index];
    }
    return null;
  },
  getReminders: () => readDB().reminders,
  saveReminder: (reminder) => {
    const db = readDB();
    reminder.id = reminder.id || "rem_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    reminder.createdAt = new Date().toISOString();
    db.reminders.push(reminder);
    writeDB(db);
    return reminder;
  },
  updateReminder: (id, updates) => {
    const db = readDB();
    const index = db.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      db.reminders[index] = { ...db.reminders[index], ...updates };
      writeDB(db);
      return db.reminders[index];
    }
    return null;
  },
  deleteReminder: (id) => {
    const db = readDB();
    const filtered = db.reminders.filter(r => r.id !== id);
    db.reminders = filtered;
    writeDB(db);
    return true;
  },
  getVitals: () => readDB().vitals,
  saveVitals: (vital) => {
    const db = readDB();
    vital.id = vital.id || "vit_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    vital.timestamp = new Date().toISOString();
    db.vitals.push(vital);
    writeDB(db);
    return vital;
  },
  getNotifications: () => readDB().notifications,
  saveNotification: (notif) => {
    const db = readDB();
    notif.id = notif.id || "not_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    notif.createdAt = new Date().toISOString();
    notif.read = false;
    db.notifications.push(notif);
    writeDB(db);
    return notif;
  },
  updateNotification: (id, updates) => {
    const db = readDB();
    const index = db.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      db.notifications[index] = { ...db.notifications[index], ...updates };
      writeDB(db);
      return db.notifications[index];
    }
    return null;
  }
};
