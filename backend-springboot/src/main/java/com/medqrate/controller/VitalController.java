package com.medqrate.controller;

import com.medqrate.entity.Notification;
import com.medqrate.entity.Vital;
import com.medqrate.repository.NotificationRepository;
import com.medqrate.repository.VitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/vitals")
@CrossOrigin(origins = "*")
public class VitalController {

    @Autowired
    private VitalRepository vitalRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Vital>> getVitalsForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(vitalRepository.findByPatientId(patientId));
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<Vital> logVitals(
            @PathVariable String patientId,
            @RequestBody Map<String, Object> body) {
        Vital vital = new Vital();
        vital.setId("vit_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        vital.setPatientId(patientId);

        Double systolic = body.get("systolic") != null ? Double.valueOf(body.get("systolic").toString()) : null;
        Double diastolic = body.get("diastolic") != null ? Double.valueOf(body.get("diastolic").toString()) : null;
        Double heartRate = body.get("heartRate") != null ? Double.valueOf(body.get("heartRate").toString()) : null;
        Double bloodSugar = body.get("bloodSugar") != null ? Double.valueOf(body.get("bloodSugar").toString()) : null;
        Double weight = body.get("weight") != null ? Double.valueOf(body.get("weight").toString()) : null;

        vital.setSystolic(systolic);
        vital.setDiastolic(diastolic);
        vital.setHeartRate(heartRate);
        vital.setBloodSugar(bloodSugar);
        vital.setWeight(weight);

        Vital saved = vitalRepository.save(vital);

        // Health Alert Thresholds
        List<String> warnings = new ArrayList<>();
        if (systolic != null && systolic > 140) warnings.add("High Blood Pressure");
        if (systolic != null && systolic < 90) warnings.add("Low Blood Pressure");
        if (heartRate != null && heartRate > 100) warnings.add("High Heart Rate");
        if (heartRate != null && heartRate < 55) warnings.add("Low Heart Rate");
        if (bloodSugar != null && bloodSugar > 180) warnings.add("High Blood Sugar");
        if (bloodSugar != null && bloodSugar < 70) warnings.add("Low Blood Sugar");

        if (!warnings.isEmpty()) {
            Notification alert = new Notification();
            alert.setId("not_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
            alert.setUserId(patientId);
            alert.setTitle("⚠️ Health Vitals Alert");
            alert.setMessage("Your logged vitals show abnormal levels: " + String.join(", ", warnings) + ". Please rest or consult Dr.");
            alert.setType("VITALS_WARNING");
            alert.setReferenceId(saved.getId());
            notificationRepository.save(alert);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
