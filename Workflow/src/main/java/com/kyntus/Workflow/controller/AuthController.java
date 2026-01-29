package com.kyntus.Workflow.controller;

import com.kyntus.Workflow.model.User;
import com.kyntus.Workflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Login Simple (Username + Password)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user != null && user.getPassword().equals(password)) {
            // Login Réussi -> On renvoie l'user (sans le mot de passe bien sûr)
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).body("Identifiants incorrects");
        }
    }
}