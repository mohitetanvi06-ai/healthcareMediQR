package com.medqrate.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    private String id;

    private String patientId;
    private String doctorId;

    @Column(columnDefinition = "TEXT")
    private String enquiry;

    private String status = "PENDING"; // "PENDING", "APPROVED"

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imagePath; // Base64 or URL

    @Column(columnDefinition = "TEXT")
    private String prescription;

    private String patientName;
    private String patientEmail;
    private String doctorName;
    private String doctorEmail;

    private String createdAt = LocalDateTime.now().toString();
    private String approvedAt;

    public Appointment() {
    }

    // Dynamic Jackson properties matching React expectations for app.patient.name and app.doctor.name
    @JsonProperty("patient")
    public Map<String, String> getPatient() {
        Map<String, String> map = new HashMap<>();
        map.put("id", patientId);
        map.put("name", patientName != null ? patientName : "Patient");
        map.put("email", patientEmail != null ? patientEmail : "");
        return map;
    }

    @JsonProperty("doctor")
    public Map<String, String> getDoctor() {
        Map<String, String> map = new HashMap<>();
        map.put("id", doctorId);
        map.put("name", doctorName != null ? doctorName : "Doctor");
        map.put("email", doctorEmail != null ? doctorEmail : "");
        return map;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getEnquiry() { return enquiry; }
    public void setEnquiry(String enquiry) { this.enquiry = enquiry; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorEmail() { return doctorEmail; }
    public void setDoctorEmail(String doctorEmail) { this.doctorEmail = doctorEmail; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }
}
