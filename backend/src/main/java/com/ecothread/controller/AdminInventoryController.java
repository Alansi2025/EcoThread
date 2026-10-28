package com.ecothread.controller;

import com.ecothread.dto.QcGradeRequest;
import com.ecothread.model.ConditionGrade;
import com.ecothread.model.InventoryItem;
import com.ecothread.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
@Tag(name = "Warehouse QC & Inventory", description = "Admin & Warehouse workstation for QC grading and stock control")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    public AdminInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "List all inventory items regardless of grade")
    public ResponseEntity<List<InventoryItem>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventoryItems());
    }

    @PostMapping("/grade")
    @Operation(summary = "Grade an intake garment (Grade A -> Catalog, Grade B -> Bulk, Grade C -> Recycle)")
    public ResponseEntity<InventoryItem> gradeIntakeItem(@Valid @RequestBody QcGradeRequest request) {
        InventoryItem graded = inventoryService.gradeIntakeItem(request);
        return ResponseEntity.ok(graded);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get count breakdown of garments across QC grades")
    public ResponseEntity<Map<String, Long>> getInventoryStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("GRADE_A", inventoryService.countByGrade(ConditionGrade.GRADE_A));
        stats.put("GRADE_B", inventoryService.countByGrade(ConditionGrade.GRADE_B));
        stats.put("RECYCLE_DOWNGRADE", inventoryService.countByGrade(ConditionGrade.RECYCLE_DOWNGRADE));
        return ResponseEntity.ok(stats);
    }
}
