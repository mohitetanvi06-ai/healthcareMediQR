package com.medqrate.controller;

import com.medqrate.entity.User;
import com.medqrate.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registered = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.sanitizeUser(registered));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            User user = userService.loginUser(email, password);
            return ResponseEntity.ok(userService.sanitizeUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login error: " + e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<User>> getDoctors() {
        List<User> sanitized = userService.getDoctors().stream()
                .map(userService::sanitizeUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sanitized);
    }

    @GetMapping("/patients")
    public ResponseEntity<List<User>> getPatients() {
        List<User> sanitized = userService.getPatients().stream()
                .map(userService::sanitizeUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sanitized);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> sanitized = userService.getAllUsers().stream()
                .map(userService::sanitizeUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sanitized);
    }
}
