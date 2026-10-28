package com.ecothread.controller;

import com.ecothread.dto.LiveTelemetryDto;
import com.ecothread.service.LiveTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@Tag(name = "Live Tracking & Fleet Telemetry", description = "Real-time spatial tracking of partner NGOs and associated zero-emission logistics fleet for donors")
public class LiveTrackingController {

    private final LiveTrackingService liveTrackingService;

    public LiveTrackingController(LiveTrackingService liveTrackingService) {
        this.liveTrackingService = liveTrackingService;
    }

    @GetMapping("/live-telemetry")
    @Operation(summary = "Get live locations of partner NGOs and associated logistics partners in real-time")
    public ResponseEntity<LiveTelemetryDto> getLiveTelemetry(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Long pickupId) {
        LiveTelemetryDto telemetry = liveTrackingService.getLiveTelemetry(lat, lng, pickupId);
        return ResponseEntity.ok(telemetry);
    }
}
