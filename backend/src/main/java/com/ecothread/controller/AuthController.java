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

    @PostMapping("/google")
    @Operation(summary = "Authenticate or register user via Google Sign-In")
    public ResponseEntity<?> googleLogin(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String roleStr = body.getOrDefault("role", "ROLE_DONOR");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Google email is required");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (Exception e) {
            role = Role.ROLE_DONOR;
        }

        Role finalRole = role;
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name != null && !name.trim().isEmpty() ? name : email.split("@")[0]);
            newUser.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            newUser.setRole(finalRole);
            newUser.setCredits(finalRole == Role.ROLE_BENEFICIARY ? 150 : 0);
            return userRepository.save(newUser);
        });

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
    @Operation(summary = "Register a new user (Donor, NGO, Beneficiary, etc.)")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_DONOR;
        int initialCredits = (role == Role.ROLE_BENEFICIARY) ? 150 : 0;

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                role,
                initialCredits
        );

        user.setOrganizationName(request.getOrganizationName());
        user.setContactPerson(request.getContactPerson());
        user.setServiceArea(request.getServiceArea());
        user.setRegistrationNumber(request.getRegistrationNumber());
        user.setBioOrMission(request.getBioOrMission());
        user.setAddress(request.getAddress());
        user.setIsVerified(role == Role.ROLE_DONOR); // Donors verified automatically, NGOs undergo verification

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
        User fresh = userRepository.findById(currentUser.getId()).orElse(currentUser);
        return ResponseEntity.ok(new UserDto(fresh));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current authenticated user profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User currentUser,
                                           @RequestBody java.util.Map<String, String> updates) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (updates.containsKey("fullName") && updates.get("fullName") != null && !updates.get("fullName").isBlank()) {
            user.setFullName(updates.get("fullName").trim());
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone"));
        }
        if (updates.containsKey("organizationName")) {
            user.setOrganizationName(updates.get("organizationName"));
        }
        if (updates.containsKey("contactPerson")) {
            user.setContactPerson(updates.get("contactPerson"));
        }
        if (updates.containsKey("serviceArea")) {
            user.setServiceArea(updates.get("serviceArea"));
        }
        if (updates.containsKey("registrationNumber")) {
            user.setRegistrationNumber(updates.get("registrationNumber"));
        }
        if (updates.containsKey("bioOrMission")) {
            user.setBioOrMission(updates.get("bioOrMission"));
        }
        if (updates.containsKey("address")) {
            user.setAddress(updates.get("address"));
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(new UserDto(updated));
    }
}
