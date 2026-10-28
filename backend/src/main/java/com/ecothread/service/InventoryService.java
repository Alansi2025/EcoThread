package com.ecothread.service;

import com.ecothread.dto.QcGradeRequest;
import com.ecothread.model.ConditionGrade;
import com.ecothread.model.InventoryItem;
import com.ecothread.model.PickupRequest;
import com.ecothread.repository.InventoryItemRepository;
import com.ecothread.repository.PickupRequestRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final PickupRequestRepository pickupRequestRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository,
                            PickupRequestRepository pickupRequestRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.pickupRequestRepository = pickupRequestRepository;
    }

    public List<InventoryItem> getCatalogItems(String gender, String category, String size, String season, String query) {
        Specification<InventoryItem> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isAvailable")));
            predicates.add(cb.equal(root.get("conditionGrade"), ConditionGrade.GRADE_A));

            if (gender != null && !gender.isBlank() && !gender.equalsIgnoreCase("all")) {
                predicates.add(cb.or(
                        cb.equal(cb.lower(root.get("targetGender")), gender.trim().toLowerCase()),
                        cb.equal(cb.lower(root.get("targetGender")), "unisex")
                ));
            }

            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            if (size != null && !size.isBlank() && !size.equalsIgnoreCase("all")) {
                predicates.add(cb.equal(cb.lower(root.get("size")), size.trim().toLowerCase()));
            }

            if (season != null && !season.isBlank() && !season.equalsIgnoreCase("all")) {
                predicates.add(cb.or(
                        cb.equal(cb.lower(root.get("season")), season.trim().toLowerCase()),
                        cb.equal(cb.lower(root.get("season")), "all season")
                ));
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return inventoryItemRepository.findAll(spec);
    }

    public InventoryItem getItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found: " + id));
    }

    public List<InventoryItem> getAllInventoryItems() {
        return inventoryItemRepository.findAll();
    }

    public List<InventoryItem> getItemsByGrade(ConditionGrade grade) {
        return inventoryItemRepository.findByConditionGrade(grade);
    }

    @Transactional
    public InventoryItem gradeIntakeItem(QcGradeRequest request) {
        InventoryItem item = new InventoryItem(
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getTargetGender(),
                request.getSize(),
                request.getSeason(),
                request.getConditionGrade(),
                request.getImageUrl(),
                request.getCreditCost() != null ? request.getCreditCost() : 0
        );
        item.setQcNotes(request.getQcNotes());

        if (request.getPickupRequestId() != null) {
            pickupRequestRepository.findById(request.getPickupRequestId())
                    .ifPresent(item::setPickupRequest);
        }

        // Only GRADE_A items are made available for beneficiary store catalog
        if (request.getConditionGrade() != ConditionGrade.GRADE_A) {
            item.setIsAvailable(false);
        } else {
            item.setIsAvailable(true);
        }

        return inventoryItemRepository.save(item);
    }

    public long countByGrade(ConditionGrade grade) {
        return inventoryItemRepository.countByConditionGrade(grade);
    }
}
