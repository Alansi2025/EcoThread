package com.ecothread.dto;

import com.ecothread.model.ConditionGrade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QcGradeRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String category;

    @NotBlank
    private String targetGender; // Men, Women, Kids, Unisex

    @NotBlank
    private String size;

    private String season = "All Season";

    @NotNull
    private ConditionGrade conditionGrade;

    private String imageUrl;

    private Integer creditCost = 0;

    private String qcNotes;

    private Long pickupRequestId;

    public QcGradeRequest() {}

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

    public Long getPickupRequestId() {
        return pickupRequestId;
    }

    public void setPickupRequestId(Long pickupRequestId) {
        this.pickupRequestId = pickupRequestId;
    }
}
