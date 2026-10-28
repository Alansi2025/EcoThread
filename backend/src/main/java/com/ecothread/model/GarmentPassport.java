package com.ecothread.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "garment_passports")
public class GarmentPassport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String passportId; // e.g. "ECO-TRC-2026-9841"

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category; // e.g., "Denim", "Knitwear", "Winter Outerwear", "Cotton Tops"

    private String materialComposition; // e.g. "98% Organic Cotton, 2% Elastane"

    @Column(nullable = false)
    private Double weightKg = 0.85;

    private String sourceCampus; // e.g. "Hostel Block C (Aryabhatta)", "South Campus Move-out"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditionGrade conditionGrade = ConditionGrade.GRADE_A;

    @Column(nullable = false)
    private String currentStage = "QC_GRADED"; 
    // Stages: "COLLECTED", "AI_ASSESSED", "QC_GRADED", "SANITIZED", "DISPATCHED", "CONFIRMED_RECOVERED"

    @Column(nullable = false)
    private String finalOutcome = "REUSED_STUDENT_STORE";
    // Outcomes: "REUSED_STUDENT_STORE", "REPAIRED_UPCYCLED", "COMMUNITY_SHELTER_DISTRIBUTION", "INDUSTRIAL_FIBER_SHREDDED"

    private String destinationPartner; // e.g. "EcoThread Campus Thrift Hub", "Goonj Community Drive", "Shivalik Fiber Mills"

    private Double lcaWaterSavedLiters = 2500.0;
    private Double lcaCo2SavedKg = 3.6;

    @Column(length = 1000)
    private String qrCodeData;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String imageUrl;

    @Column(length = 2000)
    private String timelineLog; // JSON array of timeline milestones

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public GarmentPassport() {}

    public GarmentPassport(String passportId, String title, String category, String materialComposition,
                           Double weightKg, String sourceCampus, ConditionGrade conditionGrade,
                           String currentStage, String finalOutcome, String destinationPartner,
                           Double lcaWaterSavedLiters, Double lcaCo2SavedKg, String imageUrl, String timelineLog) {
        this.passportId = passportId;
        this.title = title;
        this.category = category;
        this.materialComposition = materialComposition != null ? materialComposition : "Cotton / Mixed Fiber";
        this.weightKg = weightKg != null ? weightKg : 0.85;
        this.sourceCampus = sourceCampus != null ? sourceCampus : "Main Campus Drive";
        this.conditionGrade = conditionGrade;
        this.currentStage = currentStage != null ? currentStage : "QC_GRADED";
        this.finalOutcome = finalOutcome != null ? finalOutcome : "REUSED_STUDENT_STORE";
        this.destinationPartner = destinationPartner != null ? destinationPartner : "Campus Wardrobe Hub";
        this.lcaWaterSavedLiters = lcaWaterSavedLiters != null ? lcaWaterSavedLiters : 2500.0;
        this.lcaCo2SavedKg = lcaCo2SavedKg != null ? lcaCo2SavedKg : 3.6;
        this.imageUrl = imageUrl;
        this.timelineLog = timelineLog;
        this.qrCodeData = "https://ecothread.org/verify-passport/" + passportId;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassportId() {
        return passportId;
    }

    public void setPassportId(String passportId) {
        this.passportId = passportId;
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

    public String getMaterialComposition() {
        return materialComposition;
    }

    public void setMaterialComposition(String materialComposition) {
        this.materialComposition = materialComposition;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public String getSourceCampus() {
        return sourceCampus;
    }

    public void setSourceCampus(String sourceCampus) {
        this.sourceCampus = sourceCampus;
    }

    public ConditionGrade getConditionGrade() {
        return conditionGrade;
    }

    public void setConditionGrade(ConditionGrade conditionGrade) {
        this.conditionGrade = conditionGrade;
    }

    public String getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    public String getFinalOutcome() {
        return finalOutcome;
    }

    public void setFinalOutcome(String finalOutcome) {
        this.finalOutcome = finalOutcome;
    }

    public String getDestinationPartner() {
        return destinationPartner;
    }

    public void setDestinationPartner(String destinationPartner) {
        this.destinationPartner = destinationPartner;
    }

    public Double getLcaWaterSavedLiters() {
        return lcaWaterSavedLiters;
    }

    public void setLcaWaterSavedLiters(Double lcaWaterSavedLiters) {
        this.lcaWaterSavedLiters = lcaWaterSavedLiters;
    }

    public Double getLcaCo2SavedKg() {
        return lcaCo2SavedKg;
    }

    public void setLcaCo2SavedKg(Double lcaCo2SavedKg) {
        this.lcaCo2SavedKg = lcaCo2SavedKg;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getTimelineLog() {
        return timelineLog;
    }

    public void setTimelineLog(String timelineLog) {
        this.timelineLog = timelineLog;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
