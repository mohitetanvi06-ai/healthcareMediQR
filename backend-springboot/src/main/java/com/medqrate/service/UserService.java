package com.medqrate.service;

import com.medqrate.entity.User;
import com.medqrate.repository.UserRepository;
import com.medqrate.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (userRepository.findByEmailIgnoreCase(user.getEmail().trim()).isPresent()) {
            throw new IllegalArgumentException("User already exists");
        }

        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId("usr_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8));
        }

        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(SecurityUtil.hashPassword(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        if (email == null || password == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        User user = userOpt.get();
        String hashed = SecurityUtil.hashPassword(password);
        if (!user.getPassword().equals(hashed)) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return user;
    }

    public List<User> getDoctors() {
        return userRepository.findByRole("DOCTOR");
    }

    public List<User> getPatients() {
        return userRepository.findByRole("PATIENT");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User sanitizeUser(User user) {
        if (user == null) return null;
        User copy = new User();
        copy.setId(user.getId());
        copy.setName(user.getName());
        copy.setEmail(user.getEmail());
        copy.setRole(user.getRole());
        copy.setDob(user.getDob());
        copy.setAge(user.getAge());
        copy.setSpeciality(user.getSpeciality());
        copy.setQualification(user.getQualification());
        copy.setAddress(user.getAddress());
        copy.setPhone(user.getPhone());
        copy.setCreatedAt(user.getCreatedAt());
        copy.setPassword(null);
        return copy;
    }
}
