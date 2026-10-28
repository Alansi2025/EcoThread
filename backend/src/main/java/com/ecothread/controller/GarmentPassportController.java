package com.ecothread.controller;

import com.ecothread.dto.CreatePassportRequest;
import com.ecothread.model.GarmentPassport;
import com.ecothread.service.GarmentPassportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passports")
@Tag(name = "Garment Digital Passport & Traceability", description = "End-to-end QR-based digital product passports and recovery audit log")
public class GarmentPassportController {

    private final GarmentPassportService passportService;

    public GarmentPassportController(GarmentPassportService passportService) {
        this.passportService = passportService;
    }

    @PostMapping
    @Operation(summary = "Generate a new Digital Product Passport for a collected textile lot")
    public ResponseEntity<GarmentPassport> createPassport(@Valid @RequestBody CreatePassportRequest request) {
        GarmentPassport created = passportService.createPassport(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @Operation(summary = "List all tracked Garment Passports across the recovery lifecycle")
    public ResponseEntity<List<GarmentPassport>> getAllPassports() {
        return ResponseEntity.ok(passportService.getAllPassports());
    }

    @GetMapping("/{passportId}")
    @Operation(summary = "Public verification endpoint: look up immutable timeline and verified outcome by Passport ID")
    public ResponseEntity<?> getPassportById(@PathVariable String passportId) {
        return passportService.getPassportById(passportId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{passportId}/stage")
    @Operation(summary = "Update stage (Collected, Sanitized, Dispatched, Confirmed Recovered)")
    public ResponseEntity<GarmentPassport> updateStage(
            @PathVariable String passportId,
            @RequestBody Map<String, String> body) {
        String stage = body.get("stage");
        String outcome = body.get("outcome");
        String notes = body.get("notes");
        GarmentPassport updated = passportService.updateStage(passportId, stage, outcome, notes);
        return ResponseEntity.ok(updated);
    }
}
