-- ==========================================================
-- MedQRate MySQL Database Schema
-- Database Name: medqrate_db
-- ==========================================================

CREATE DATABASE IF NOT EXISTS medqrate_db;
USE medqrate_db;

-- Users Table (Stores Doctors and Patients)
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
);

-- Pre-populated Default Users for testing
-- Default password is 'password123' (SHA-256 hashed)
INSERT IGNORE INTO users (id, name, email, password, role, speciality, qualification, address, phone)
VALUES (
  'doc1',
  'John Doe',
  'doctor@medqrate.com',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'DOCTOR',
  'Cardiologist',
  'MD, DM (Cardiology)',
  'Chinchwad, Pune',
  '9876543210'
);

INSERT IGNORE INTO users (id, name, email, password, role, dob, age, address, phone)
VALUES (
  'pat1',
  'Jane Smith',
  'patient@medqrate.com',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'PATIENT',
  '1995-08-15',
  '30',
  'Aundh, Pune',
  '9988776655'
);
