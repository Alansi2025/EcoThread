package com.ecothread.controller;

import com.ecothread.dto.GarmentAssessmentRequest;
import com.ecothread.dto.GarmentAssessmentResponse;
import com.ecothread.service.EcoGradeAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "EcoGrade AI Assessment", description = "AI-assisted garment quality recovery classification and LCA impact prediction")
public class EcoGradeAiController {

    private final EcoGradeAiService ecoGradeAiService;

    public EcoGradeAiController(EcoGradeAiService ecoGradeAiService) {
        this.ecoGradeAiService = ecoGradeAiService;
    }

    @PostMapping("/assess-garment")
    @Operation(summary = "Evaluate garment condition and recommend optimal circular recovery route")
    public ResponseEntity<GarmentAssessmentResponse> assessGarment(@Valid @RequestBody GarmentAssessmentRequest request) {
        GarmentAssessmentResponse response = ecoGradeAiService.assessGarment(request);
        return ResponseEntity.ok(response);
    }
}
