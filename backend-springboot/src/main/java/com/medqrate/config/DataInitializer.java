package com.medqrate.config;

import com.medqrate.entity.User;
import com.medqrate.repository.UserRepository;
import com.medqrate.util.SecurityUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                String defaultPass = SecurityUtil.hashPassword("password123");

                User doctor = new User("doc1", "John Doe", "doctor@medqrate.com", defaultPass, "DOCTOR");
                doctor.setSpeciality("Cardiologist");
                doctor.setQualification("MD, DM (Cardiology)");
                doctor.setAddress("Chinchwad, Pune");
                doctor.setPhone("9876543210");
                userRepository.save(doctor);

                User patient = new User("pat1", "Jane Smith", "patient@medqrate.com", defaultPass, "PATIENT");
                patient.setDob("1995-08-15");
                patient.setAge("30");
                patient.setAddress("Aundh, Pune");
                patient.setPhone("9988776655");
                userRepository.save(patient);

                System.out.println("🌱 [Spring Boot] Initialized default doctor and patient in MySQL database.");
            }
        };
    }
}
