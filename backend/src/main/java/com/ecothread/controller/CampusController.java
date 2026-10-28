package com.ecothread.controller;

import com.ecothread.dto.CampusStatsResponse;
import com.ecothread.service.CampusCircularityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/campus")
@Tag(name = "Campus Circularity Hub", description = "Hostel move-out drive metrics, leaderboard, and confirmed circular recovery outcomes")
public class CampusController {

    private final CampusCircularityService campusCircularityService;

    public CampusController(CampusCircularityService campusCircularityService) {
        this.campusCircularityService = campusCircularityService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get aggregated campus circularity data, hostel leaderboard, and LCA environmental outcomes")
    public ResponseEntity<CampusStatsResponse> getCampusStats() {
        return ResponseEntity.ok(campusCircularityService.getCampusStats());
    }
}
