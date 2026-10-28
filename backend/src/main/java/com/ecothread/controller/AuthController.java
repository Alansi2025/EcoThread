package com.ecothread.controller;

import com.ecothread.config.JwtTokenProvider;
import com.ecothread.dto.AuthRequest;
import com.ecothread.dto.AuthResponse;
import com.ecothread.dto.RegisterRequest;
import com.ecothread.dto.UserDto;
import com.ecothread.model.Role;
import com.ecothread.model.User;
import com.ecothread.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user login, registration, and profile")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT Bearer token")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Invalid email or password credentials");
        }

        String token = tokenProvider.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCredits()
        ));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user (Donor, Beneficiary, etc.)")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_DONOR;
        // Beneficiaries start with 150 seasonal credits by default
        int initialCredits = (role == Role.ROLE_BENEFICIARY) ? 150 : 0;

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                role,
                initialCredits
        );

        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved);

        return ResponseEntity.ok(new AuthResponse(
                token,
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole(),
                saved.getCredits()
        ));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }
        // Refresh from DB to get latest credits and details
        User fresh = userRepository.findById(currentUser.getId()).orElse(currentUser);
        return ResponseEntity.ok(new UserDto(fresh));
    }
}
