package com.medqrate.controller;

import com.medqrate.entity.Reminder;
import com.medqrate.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {

    @Autowired
    private ReminderRepository reminderRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Reminder>> getRemindersForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(reminderRepository.findByPatientId(patientId));
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<?> createReminder(
            @PathVariable String patientId,
            @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String dosage = (String) body.get("dosage");
        Object timingObj = body.get("timing");

        if (name == null || dosage == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name and dosage are required"));
        }

        Reminder reminder = new Reminder();
        reminder.setId("rem_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        reminder.setPatientId(patientId);
        reminder.setName(name);
        reminder.setDosage(dosage);
        reminder.setTiming(timingObj != null ? timingObj.toString() : "");
        reminder.setFrequency((String) body.getOrDefault("frequency", "daily"));
        reminder.setStartDate((String) body.getOrDefault("startDate", LocalDate.now().toString()));
        reminder.setEndDate((String) body.get("endDate"));
        reminder.setLogs("{}");

        Reminder saved = reminderRepository.save(reminder);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/toggle/{reminderId}")
    public ResponseEntity<?> toggleReminder(
            @PathVariable String reminderId,
            @RequestBody Map<String, String> body) {
        Optional<Reminder> opt = reminderRepository.findById(reminderId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Reminder not found"));
        }

        String date = body.getOrDefault("date", LocalDate.now().toString());
        String status = body.getOrDefault("status", "TAKEN");

        Reminder reminder = opt.get();
        reminder.setLogs("{\"" + date + "\": \"" + status + "\"}");
        Reminder updated = reminderRepository.save(reminder);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{reminderId}")
    public ResponseEntity<?> deleteReminder(@PathVariable String reminderId) {
        reminderRepository.deleteById(reminderId);
        return ResponseEntity.ok(Map.of("message", "Reminder deleted successfully"));
    }
}
