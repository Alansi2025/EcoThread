package com.ecothread.controller;

import com.ecothread.dto.PickupCreateRequest;
import com.ecothread.dto.PickupStatusUpdateRequest;
import com.ecothread.model.PickupRequest;
import com.ecothread.model.Role;
import com.ecothread.model.User;
import com.ecothread.service.PickupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pickups")
@Tag(name = "Pickups & Donations", description = "Endpoints for scheduling, managing, and accepting donations")
public class PickupController {

    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping
    @Operation(summary = "Create/Schedule a donation pickup (Donor)")
    public ResponseEntity<PickupRequest> schedulePickup(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody PickupCreateRequest request) {
        PickupRequest created = pickupService.createPickup(currentUser, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @Operation(summary = "Get donations/pickups for current user (or all if Logistics/Admin)")
    public ResponseEntity<List<PickupRequest>> getPickups(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_LOGISTICS) {
            return ResponseEntity.ok(pickupService.getAllPickups());
        }
        if (currentUser.getRole() == Role.ROLE_NGO) {
            return ResponseEntity.ok(pickupService.getAcceptedDonations(currentUser.getId()));
        }
        return ResponseEntity.ok(pickupService.getPickupsForDonor(currentUser.getId()));
    }

    @GetMapping("/available")
    @Operation(summary = "Browse all unaccepted donations available for NGOs")
    public ResponseEntity<List<PickupRequest>> getAvailableDonations() {
        return ResponseEntity.ok(pickupService.getAvailableDonations());
    }

    @GetMapping("/accepted")
    @Operation(summary = "Get donations accepted by current NGO")
    public ResponseEntity<List<PickupRequest>> getAcceptedDonations(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(pickupService.getAcceptedDonations(currentUser.getId()));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "NGO accepts an available donation (with mutual locking)")
    public ResponseEntity<?> acceptDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String notes = body != null ? body.get("notes") : null;
            PickupRequest accepted = pickupService.acceptDonation(id, currentUser, notes);
            return ResponseEntity.ok(accepted);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/decline")
    @Operation(summary = "NGO releases an accepted donation back to available pool")
    public ResponseEntity<?> declineDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            PickupRequest declined = pickupService.declineDonation(id, currentUser, reason);
            return ResponseEntity.ok(declined);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats/donor")
    @Operation(summary = "Get real calculated donation metrics for authenticated donor")
    public ResponseEntity<Map<String, Object>> getDonorStats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(pickupService.getDonorStats(currentUser.getId()));
    }

    @GetMapping("/stats/ngo")
    @Operation(summary = "Get real calculated collection and acceptance metrics for authenticated NGO")
    public ResponseEntity<Map<String, Object>> getNgoStats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(pickupService.getNgoStats(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation/pickup details by ID")
    public ResponseEntity<PickupRequest> getPickupById(@PathVariable Long id) {
        return ResponseEntity.ok(pickupService.getPickupById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update pickup status (Logistics/Admin/NGO)")
    public ResponseEntity<PickupRequest> updatePickupStatus(
            @PathVariable Long id,
            @Valid @RequestBody PickupStatusUpdateRequest request) {
        PickupRequest updated = pickupService.updatePickupStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending or submitted donation request (Donor/Admin)")
    public ResponseEntity<PickupRequest> cancelPickup(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) com.ecothread.dto.CancelPickupRequest request) {
        PickupRequest cancelled = pickupService.cancelPickup(id, currentUser, request);
        return ResponseEntity.ok(cancelled);
    }

    @PatchMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule date and time slot for a pickup request (Donor/Admin)")
    public ResponseEntity<PickupRequest> reschedulePickup(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody com.ecothread.dto.ReschedulePickupRequest request) {
        PickupRequest rescheduled = pickupService.reschedulePickup(id, currentUser, request);
        return ResponseEntity.ok(rescheduled);
    }
}
