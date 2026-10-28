package com.ecothread.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_request_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PickupRequest pickupRequest;

    @Column(nullable = false)
    private String title;

    @Column(length = 1500)
    private String description;

    @Column(nullable = false)
    private String category; // e.g., "Outerwear", "Tops & Shirts", "Denims & Trousers", "Ethnic & Traditional", "Children's Wear"

    @Column(nullable = false)
    private String targetGender; // "Men", "Women", "Kids", "Unisex"

    @Column(nullable = false)
    private String size; // "XS", "S", "M", "L", "XL", "XXL", "Free Size"

    private String season = "All Season"; // "Winter", "Summer", "Monsoon", "All Season"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditionGrade conditionGrade = ConditionGrade.GRADE_A;

    @Column(length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false)
    private Integer creditCost = 0; // Zero-cost allowance or token credits (e.g. 0 to 10)

    @Column(length = 500)
    private String qcNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public InventoryItem() {}

    public InventoryItem(String title, String description, String category, String targetGender, String size,
                         String season, ConditionGrade conditionGrade, String imageUrl, Integer creditCost) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.targetGender = targetGender;
        this.size = size;
        this.season = season != null ? season : "All Season";
        this.conditionGrade = conditionGrade;
        this.imageUrl = imageUrl;
        this.creditCost = creditCost != null ? creditCost : 0;
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PickupRequest getPickupRequest() {
        return pickupRequest;
    }

    public void setPickupRequest(PickupRequest pickupRequest) {
        this.pickupRequest = pickupRequest;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTargetGender() {
        return targetGender;
    }

    public void setTargetGender(String targetGender) {
        this.targetGender = targetGender;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public ConditionGrade getConditionGrade() {
        return conditionGrade;
    }

    public void setConditionGrade(ConditionGrade conditionGrade) {
        this.conditionGrade = conditionGrade;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Integer getCreditCost() {
        return creditCost;
    }

    public void setCreditCost(Integer creditCost) {
        this.creditCost = creditCost;
    }

    public String getQcNotes() {
        return qcNotes;
    }

    public void setQcNotes(String qcNotes) {
        this.qcNotes = qcNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
