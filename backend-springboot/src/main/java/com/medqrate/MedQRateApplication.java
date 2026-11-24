package com.medqrate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MedQRateApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedQRateApplication.class, args);
        System.out.println("🚀 MedQRate Spring Boot Backend running on http://localhost:8080");
    }
}
