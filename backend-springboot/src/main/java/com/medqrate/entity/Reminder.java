package com.medqrate.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    private String id;

    private String patientId;
    private String name;
    private String dosage;

    @Column(columnDefinition = "TEXT")
    private String timing; // JSON or comma-separated timings

    private String frequency = "daily";
    private String startDate;
    private String endDate;

    @Column(columnDefinition = "TEXT")
    private String logs; // JSON string of logs e.g. {"2026-11-24": "TAKEN"}

    private String createdAt = LocalDateTime.now().toString();

    public Reminder() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getLogs() { return logs; }
    public void setLogs(String logs) { this.logs = logs; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
