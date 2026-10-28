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

@RestController
@RequestMapping("/api/pickups")
@Tag(name = "Pickups", description = "Endpoints for scheduling and managing doorstep pickups")
public class PickupController {

    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping
    @Operation(summary = "Schedule a doorstep clothing pickup (Donor)")
    public ResponseEntity<PickupRequest> schedulePickup(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody PickupCreateRequest request) {
        PickupRequest created = pickupService.createPickup(currentUser, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @Operation(summary = "Get pickups for current user (or all if Logistics/Admin)")
    public ResponseEntity<List<PickupRequest>> getPickups(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_LOGISTICS) {
            return ResponseEntity.ok(pickupService.getAllPickups());
        }
        return ResponseEntity.ok(pickupService.getPickupsForDonor(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pickup details by ID")
    public ResponseEntity<PickupRequest> getPickupById(@PathVariable Long id) {
        return ResponseEntity.ok(pickupService.getPickupById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update pickup status (Logistics/Admin)")
    public ResponseEntity<PickupRequest> updatePickupStatus(
            @PathVariable Long id,
            @Valid @RequestBody PickupStatusUpdateRequest request) {
        PickupRequest updated = pickupService.updatePickupStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending or assigned pickup request (Donor/Admin)")
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
