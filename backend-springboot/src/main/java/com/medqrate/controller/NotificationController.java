package com.medqrate.controller;

import com.medqrate.entity.Notification;
import com.medqrate.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsForUser(@PathVariable String userId) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PutMapping("/read/{notificationId}")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        Optional<Notification> opt = notificationRepository.findById(notificationId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Notification not found"));
        }

        Notification notif = opt.get();
        notif.setRead(true);
        Notification saved = notificationRepository.save(notif);
        return ResponseEntity.ok(saved);
    }
}
