package com.ecothread.controller;

import com.ecothread.dto.DonorImpactResponse;
import com.ecothread.dto.ImpactStatsResponse;
import com.ecothread.model.User;
import com.ecothread.service.ImpactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/impact")
@Tag(name = "Environmental Impact", description = "Public sustainability and carbon/water offset metrics")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(ImpactService impactService) {
        this.impactService = impactService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide environmental impact and circular redistribution metrics")
    public ResponseEntity<ImpactStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(impactService.getPlatformStats());
    }

    @GetMapping("/donor")
    @Operation(summary = "Get personalized cumulative environmental impact for the authenticated donor")
    public ResponseEntity<DonorImpactResponse> getDonorImpact(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(impactService.getDonorImpact(currentUser));
    }
}
