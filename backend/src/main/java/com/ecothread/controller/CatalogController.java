package com.ecothread.controller;

import com.ecothread.model.InventoryItem;
import com.ecothread.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@Tag(name = "Catalog", description = "Public & Beneficiary store catalog of Grade-A cleaned garments")
public class CatalogController {

    private final InventoryService inventoryService;

    public CatalogController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Browse cleaned Grade-A apparel with multi-attribute filters")
    public ResponseEntity<List<InventoryItem>> getCatalog(
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String q) {
        List<InventoryItem> items = inventoryService.getCatalogItems(gender, category, size, season, q);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific catalog item details by ID")
    public ResponseEntity<InventoryItem> getItemDetails(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getItemById(id));
    }

    @PostMapping("/submit-donor-item")
    @Operation(summary = "Donor submits AI-analyzed item to NGO catalog & community network")
    public ResponseEntity<InventoryItem> submitDonorItem(@RequestBody java.util.Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "Donated Apparel Item");
        String description = (String) body.getOrDefault("description", "Direct donor contribution via EcoThread platform");
        String category = (String) body.getOrDefault("category", "Tops & Shirts");
        String targetGender = (String) body.getOrDefault("targetGender", "Unisex");
        String size = (String) body.getOrDefault("size", "Free Size");
        String season = (String) body.getOrDefault("season", "All Season");
        String imageUrl = (String) body.getOrDefault("imageUrl", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80");
        Integer qualityScore = (Integer) body.getOrDefault("qualityScore", 85);
        String qcNotes = (String) body.getOrDefault("qcNotes", "AI Quality: " + qualityScore + "/100 verified");

        com.ecothread.model.ConditionGrade grade = (qualityScore >= 50) 
            ? com.ecothread.model.ConditionGrade.GRADE_A 
            : com.ecothread.model.ConditionGrade.GRADE_C;

        com.ecothread.dto.QcGradeRequest gradeReq = new com.ecothread.dto.QcGradeRequest();
        gradeReq.setTitle(title);
        gradeReq.setDescription(description);
        gradeReq.setCategory(category);
        gradeReq.setTargetGender(targetGender);
        gradeReq.setSize(size);
        gradeReq.setSeason(season);
        gradeReq.setConditionGrade(grade);
        gradeReq.setImageUrl(imageUrl);
        gradeReq.setCreditCost(0); // Zero cost for NGO & community beneficiaries
        gradeReq.setQcNotes(qcNotes);

        InventoryItem saved = inventoryService.gradeIntakeItem(gradeReq);
        return ResponseEntity.ok(saved);
    }
}
