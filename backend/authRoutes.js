const express = require("express");
const router = express.Router();
const db = require("./db");

// Register
router.post("/register", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await db.saveUser(req.body);
    const userResponse = { ...newUser };
    delete userResponse.password; // Don't return password
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Register route error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const hashed = db.hashPassword(password);
    if (user.password !== hashed) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userResponse = { ...user };
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Get Doctors
router.get("/doctors", async (req, res) => {
  try {
    const users = await db.getUsers();
    const doctors = users.filter(u => u.role === "DOCTOR");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});

// Get Patients
router.get("/patients", async (req, res) => {
  try {
    const users = await db.getUsers();
    const patients = users.filter(u => u.role === "PATIENT");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients" });
  }
});

// Get All Users
router.get("/all", async (req, res) => {
  try {
    const users = await db.getUsers();
    const allUsers = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all users" });
  }
});

module.exports = router;
