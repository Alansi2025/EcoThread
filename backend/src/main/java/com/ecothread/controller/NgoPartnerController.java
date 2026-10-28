package com.ecothread.controller;

import com.ecothread.dto.NgoLocatorDto;
import com.ecothread.service.NgoPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ngos")
@Tag(name = "NGO Urgent Needs & Smart Eco-Route", description = "Locate verified NGOs needing clothing, with distance & travel CO2 emission calculation")
public class NgoPartnerController {

    private final NgoPartnerService ngoPartnerService;

    public NgoPartnerController(NgoPartnerService ngoPartnerService) {
        this.ngoPartnerService = ngoPartnerService;
    }

    @GetMapping
    @Operation(summary = "Find nearby NGOs matching garment requirements, with distance and travel emission matrix")
    public ResponseEntity<List<NgoLocatorDto>> getNearbyNgos(
            @RequestParam(required = false, defaultValue = "28.5458") Double lat,
            @RequestParam(required = false, defaultValue = "77.1926") Double lng,
            @RequestParam(required = false) String neededType) {
        List<NgoLocatorDto> ngos = ngoPartnerService.getNearbyNgos(lat, lng, neededType);
        return ResponseEntity.ok(ngos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific NGO partner details, needs, and eco-route emissions")
    public ResponseEntity<NgoLocatorDto> getNgoById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "28.5458") Double lat,
            @RequestParam(required = false, defaultValue = "77.1926") Double lng) {
        return ResponseEntity.ok(ngoPartnerService.getNgoById(id, lat, lng));
    }
}
