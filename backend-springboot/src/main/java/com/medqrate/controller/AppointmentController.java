package com.medqrate.controller;

import com.medqrate.entity.Appointment;
import com.medqrate.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book/{patientId}/{doctorId}")
    public ResponseEntity<?> bookAppointment(
            @PathVariable String patientId,
            @PathVariable String doctorId,
            @RequestBody Map<String, String> body) {
        try {
            String enquiry = body.getOrDefault("enquiry", "");
            Appointment app = appointmentService.bookAppointment(patientId, doctorId, enquiry);
            return ResponseEntity.status(HttpStatus.CREATED).body(app);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Booking failed: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsForDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(doctorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable String id) {
        Optional<Appointment> appOpt = appointmentService.getAppointmentById(id);
        if (appOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Appointment not found"));
        }
        return ResponseEntity.ok(appOpt.get());
    }

    @PutMapping("/approve/{appointmentId}")
    public ResponseEntity<?> approveAppointment(
            @PathVariable String appointmentId,
            @RequestBody Map<String, String> body) {
        try {
            String imagePath = body.get("imagePath");
            String prescription = body.get("prescription");
            Appointment approved = appointmentService.approveAppointment(appointmentId, imagePath, prescription);
            return ResponseEntity.ok(approved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Approval failed: " + e.getMessage()));
        }
    }
}
