package com.ecothread.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_requests")
public class PickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private User donor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private User driver;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_ngo_user_id")
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private User assignedNgoUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_ngo_partner_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private NgoPartner assignedNgo;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
    @JoinColumn(name = "pickup_address_id", nullable = false)
    private Address pickupAddress;

    // Donation details
    private String title;
    private String category;
    private Integer quantity;
    private String unit;
    private String conditionDescription;
    private String imageUrl;
    private Integer qualityScore;
    private String pickupOrDropoff = "PICKUP"; // "PICKUP" or "DROPOFF"

    @Column(nullable = false)
    private LocalDate scheduledDate;

    @Column(nullable = false)
    private String timeSlot;

    @Column(nullable = false)
    private Integer bagCount = 1;

    @Column(length = 1000)
    private String clothTypes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PickupStatus status = PickupStatus.SUBMITTED;

    @Column(length = 1000)
    private String driverNotes;

    @Column(length = 1000)
    private String additionalInstructions;

    private Double estimatedWeightKg;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PickupRequest() {}

    public PickupRequest(User donor, Address pickupAddress, LocalDate scheduledDate, String timeSlot, Integer bagCount, String clothTypes) {
        this.donor = donor;
        this.pickupAddress = pickupAddress;
        this.scheduledDate = scheduledDate;
        this.timeSlot = timeSlot;
        this.bagCount = bagCount != null ? bagCount : 1;
        this.clothTypes = clothTypes;
        this.status = PickupStatus.SUBMITTED;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDonor() {
        return donor;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public User getAssignedNgoUser() {
        return assignedNgoUser;
    }

    public void setAssignedNgoUser(User assignedNgoUser) {
        this.assignedNgoUser = assignedNgoUser;
    }

    public NgoPartner getAssignedNgo() {
        return assignedNgo;
    }

    public void setAssignedNgo(NgoPartner assignedNgo) {
        this.assignedNgo = assignedNgo;
    }

    public Address getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(Address pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getConditionDescription() {
        return conditionDescription;
    }

    public void setConditionDescription(String conditionDescription) {
        this.conditionDescription = conditionDescription;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Integer qualityScore) {
        this.qualityScore = qualityScore;
    }

    public String getPickupOrDropoff() {
        return pickupOrDropoff;
    }

    public void setPickupOrDropoff(String pickupOrDropoff) {
        this.pickupOrDropoff = pickupOrDropoff;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public Integer getBagCount() {
        return bagCount;
    }

    public void setBagCount(Integer bagCount) {
        this.bagCount = bagCount;
    }

    public String getClothTypes() {
        return clothTypes;
    }

    public void setClothTypes(String clothTypes) {
        this.clothTypes = clothTypes;
    }

    public PickupStatus getStatus() {
        return status;
    }

    public void setStatus(PickupStatus status) {
        this.status = status;
    }

    public String getDriverNotes() {
        return driverNotes;
    }

    public void setDriverNotes(String driverNotes) {
        this.driverNotes = driverNotes;
    }

    public String getAdditionalInstructions() {
        return additionalInstructions;
    }

    public void setAdditionalInstructions(String additionalInstructions) {
        this.additionalInstructions = additionalInstructions;
    }

    public Double getEstimatedWeightKg() {
        return estimatedWeightKg;
    }

    public void setEstimatedWeightKg(Double estimatedWeightKg) {
        this.estimatedWeightKg = estimatedWeightKg;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
