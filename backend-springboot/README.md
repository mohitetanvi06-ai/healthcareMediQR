# MedQRate - Enterprise Spring Boot Backend (Java 17 + MySQL)

## 📌 Overview
This is the enterprise REST API backend for the **MedQRate Healthcare System**, built using **Java 17**, **Spring Boot 3.2.5**, **Spring Data JPA**, and **MySQL**.

It is completely integrated with the **React.js** frontend.

---

## 🛠️ Technology Stack
- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17 (OpenJDK Temurin)
- **Persistence (ORM)**: Spring Data JPA (Hibernate)
- **Database**: MySQL 8.0 (`medqrate_db`)
- **Build Tool**: Maven (`pom.xml`)
- **Security / Hashing**: SHA-256 Digest

---

## 📂 Project Architecture (3-Tier Layered Design)
```
com.medqrate
 ├── MedQRateApplication.java          # Spring Boot Main Entry Point
 ├── config/
 │    ├── CorsConfig.java              # Cross-Origin configuration for React (port 3000)
 │    └── DataInitializer.java         # Database Seeding for default Doctor & Patient
 ├── controller/                       # REST API Endpoints (@RestController)
 │    ├── AuthController.java          # /api/auth (Login, Register, Doctors, Patients)
 │    ├── AppointmentController.java   # /api/appointments (Book, Approve, Prescriptions)
 │    ├── ReminderController.java      # /api/reminders (Medicine Alarms & Logs)
 │    ├── VitalController.java         # /api/vitals (BP, Sugar, Health Alerts)
 │    ├── NotificationController.java  # /api/notifications (Read, Mark as Read)
 │    └── HealthController.java        # /api/health (Server status)
 ├── service/                          # Business Logic Layer (@Service)
 │    ├── UserService.java
 │    └── AppointmentService.java
 ├── repository/                       # Database Repositories (JpaRepository)
 │    ├── UserRepository.java
 │    ├── AppointmentRepository.java
 │    ├── ReminderRepository.java
 │    ├── VitalRepository.java
 │    └── NotificationRepository.java
 ├── entity/                           # JPA Entities (@Entity, @Table)
 │    ├── User.java
 │    ├── Appointment.java
 │    ├── Reminder.java
 │    ├── Vital.java
 │    └── Notification.java
 └── util/
      └── SecurityUtil.java            # Password Hashing Utility
```

---

## 🚀 How to Run

### Option 1: Using Eclipse / Spring Tool Suite (STS)
1. Open Eclipse / STS.
2. Click **File** ➔ **Import** ➔ **Existing Maven Projects**.
3. Browse and select the `backend-springboot` directory.
4. Right-click on `MedQRateApplication.java` ➔ **Run As** ➔ **Spring Boot App** (or **Java Application**).

### Option 2: Using IntelliJ IDEA
1. Open IntelliJ IDEA.
2. Click **File** ➔ **Open** and select `backend-springboot`.
3. IntelliJ will auto-detect Maven and download dependencies.
4. Click the green **Run (▶)** button on `MedQRateApplication.java`.

### Option 3: Using VS Code
1. Install **Extension Pack for Java** and **Spring Boot Extension Pack**.
2. Open the `backend-springboot` folder.
3. Open `MedQRateApplication.java` and click **Run**.

### Option 4: Using Maven CLI
```powershell
cd backend-springboot
mvn spring-boot:run
```

---

## 🔑 Default Accounts (Auto-Seeded into MySQL)
1. **Doctor**:
   - Email: `doctor@medqrate.com`
   - Password: `password123`
2. **Patient**:
   - Email: `patient@medqrate.com`
   - Password: `password123`
