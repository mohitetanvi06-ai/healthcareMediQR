package com.medqrate.service;

import com.medqrate.entity.Appointment;
import com.medqrate.entity.Notification;
import com.medqrate.entity.User;
import com.medqrate.repository.AppointmentRepository;
import com.medqrate.repository.NotificationRepository;
import com.medqrate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Appointment bookAppointment(String patientId, String doctorId, String enquiry) {
        Optional<User> patientOpt = userRepository.findById(patientId);
        Optional<User> doctorOpt = userRepository.findById(doctorId);

        if (patientOpt.isEmpty() || doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Patient or Doctor not found");
        }

        User patient = patientOpt.get();
        User doctor = doctorOpt.get();

        Appointment app = new Appointment();
        app.setId("app_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        app.setPatientId(patientId);
        app.setDoctorId(doctorId);
        app.setEnquiry(enquiry);
        app.setStatus("PENDING");
        app.setPatientName(patient.getName());
        app.setPatientEmail(patient.getEmail());
        app.setDoctorName(doctor.getName());
        app.setDoctorEmail(doctor.getEmail());
        app.setCreatedAt(LocalDateTime.now().toString());

        Appointment saved = appointmentRepository.save(app);

        // Notify Doctor
        Notification notif = new Notification();
        notif.setId("not_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        notif.setUserId(doctorId);
        notif.setTitle("New Appointment Request");
        notif.setMessage(patient.getName() + " has requested an appointment for: \"" + enquiry + "\"");
        notif.setType("APPOINTMENT_REQUEST");
        notif.setReferenceId(saved.getId());
        notificationRepository.save(notif);

        return saved;
    }

    public List<Appointment> getAppointmentsForPatient(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsForDoctor(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public Optional<Appointment> getAppointmentById(String id) {
        return appointmentRepository.findById(id);
    }

    public Appointment approveAppointment(String appointmentId, String imagePath, String prescription) {
        Optional<Appointment> opt = appointmentRepository.findById(appointmentId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Appointment not found");
        }

        Appointment app = opt.get();
        app.setStatus("APPROVED");
        app.setImagePath(imagePath);
        app.setPrescription(prescription);
        app.setApprovedAt(LocalDateTime.now().toString());

        Appointment updated = appointmentRepository.save(app);

        // Notify Patient
        Notification notif = new Notification();
        notif.setId("not_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        notif.setUserId(app.getPatientId());
        notif.setTitle("Appointment Approved & Prescription Ready");
        notif.setMessage("Dr. " + app.getDoctorName() + " approved your appointment and uploaded your prescription.");
        notif.setType("APPOINTMENT_APPROVED");
        notif.setReferenceId(appointmentId);
        notificationRepository.save(notif);

        return updated;
    }
}
