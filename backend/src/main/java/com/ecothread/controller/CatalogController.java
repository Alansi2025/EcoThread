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
}
