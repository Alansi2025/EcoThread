package com.ecothread.controller;

import com.ecothread.dto.OrderCheckoutRequest;
import com.ecothread.model.BeneficiaryOrder;
import com.ecothread.model.OrderStatus;
import com.ecothread.model.Role;
import com.ecothread.model.User;
import com.ecothread.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Beneficiary Orders", description = "Endpoints for cart checkout and order dispatch tracking")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart items using seasonal allowance credits")
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody OrderCheckoutRequest request) {
        try {
            BeneficiaryOrder order = orderService.checkout(currentUser, request);
            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "List orders for authenticated user (or all if Admin/Logistics)")
    public ResponseEntity<List<BeneficiaryOrder>> getOrders(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_LOGISTICS) {
            return ResponseEntity.ok(orderService.getAllOrders());
        }
        return ResponseEntity.ok(orderService.getOrdersForBeneficiary(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<BeneficiaryOrder> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order delivery and dispatch status (Admin/Logistics)")
    public ResponseEntity<BeneficiaryOrder> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        BeneficiaryOrder updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
