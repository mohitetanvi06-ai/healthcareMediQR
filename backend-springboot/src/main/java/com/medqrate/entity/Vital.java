package com.medqrate.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vitals")
public class Vital {

    @Id
    private String id;

    private String patientId;
    private Double systolic;
    private Double diastolic;
    private Double heartRate;
    private Double bloodSugar;
    private Double weight;

    private String timestamp = LocalDateTime.now().toString();

    public Vital() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public Double getSystolic() { return systolic; }
    public void setSystolic(Double systolic) { this.systolic = systolic; }

    public Double getDiastolic() { return diastolic; }
    public void setDiastolic(Double diastolic) { this.diastolic = diastolic; }

    public Double getHeartRate() { return heartRate; }
    public void setHeartRate(Double heartRate) { this.heartRate = heartRate; }

    public Double getBloodSugar() { return bloodSugar; }
    public void setBloodSugar(Double bloodSugar) { this.bloodSugar = bloodSugar; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
