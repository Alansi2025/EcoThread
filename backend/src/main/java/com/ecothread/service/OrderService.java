package com.ecothread.service;

import com.ecothread.dto.OrderCheckoutRequest;
import com.ecothread.model.*;
import com.ecothread.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final BeneficiaryOrderRepository orderRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public OrderService(BeneficiaryOrderRepository orderRepository,
                        InventoryItemRepository inventoryItemRepository,
                        AddressRepository addressRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BeneficiaryOrder checkout(User beneficiary, OrderCheckoutRequest request) {
        if (request.getItemIds() == null || request.getItemIds().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty for checkout");
        }

        List<InventoryItem> items = inventoryItemRepository.findAllById(request.getItemIds());

        // Check availability
        for (InventoryItem item : items) {
            if (!Boolean.TRUE.equals(item.getIsAvailable())) {
                throw new IllegalStateException("Item '" + item.getTitle() + "' is no longer available.");
            }
        }

        // Calculate total credit cost
        int totalCredits = items.stream().mapToInt(InventoryItem::getCreditCost).sum();

        // Check beneficiary credit balance
        int currentCredits = beneficiary.getCredits() != null ? beneficiary.getCredits() : 0;
        if (currentCredits < totalCredits) {
            throw new IllegalStateException("Insufficient credit balance! Required: " + totalCredits + ", Available: " + currentCredits);
        }

        // Deduct credits
        beneficiary.setCredits(currentCredits - totalCredits);
        userRepository.save(beneficiary);

        // Create Address if provided
        Address address = null;
        if (request.getStreetAddress() != null && !request.getStreetAddress().isBlank()) {
            address = new Address(
                    beneficiary,
                    request.getStreetAddress(),
                    request.getCity() != null ? request.getCity() : "Bengaluru",
                    request.getState() != null ? request.getState() : "Karnataka",
                    request.getPincode() != null ? request.getPincode() : "560001",
                    12.9716,
                    77.5946
            );
            address = addressRepository.save(address);
        }

        // Create Order
        String orderNumber = "ORD-" + System.currentTimeMillis() % 1000000;
        BeneficiaryOrder order = new BeneficiaryOrder(orderNumber, beneficiary, address, totalCredits);

        for (InventoryItem item : items) {
            item.setIsAvailable(false);
            inventoryItemRepository.save(item);
            order.addItem(item, item.getCreditCost());
        }

        return orderRepository.save(order);
    }

    public List<BeneficiaryOrder> getOrdersForBeneficiary(Long beneficiaryId) {
        return orderRepository.findByBeneficiaryIdOrderByCreatedAtDesc(beneficiaryId);
    }

    public List<BeneficiaryOrder> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public BeneficiaryOrder getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    @Transactional
    public BeneficiaryOrder updateOrderStatus(Long orderId, OrderStatus status) {
        BeneficiaryOrder order = getOrderById(orderId);
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }
}
