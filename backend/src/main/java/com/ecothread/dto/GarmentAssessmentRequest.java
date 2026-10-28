package com.ecothread.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class GarmentAssessmentRequest {

    @NotBlank
    private String title;

    private String category; // "Outerwear", "Denims", "Tops & Shirts", "Knitwear", "Ethnic", "Children"
    private String fabricComposition; // "100% Cotton", "Polyester Blend", "Wool / Cashmere", "Denim", "Linen"
    private String wearDuration; // "< 6 Months", "6-12 Months", "1-2 Years", "> 2 Years"
    
    private Boolean hasTears = false;
    private Boolean hasPermanentStains = false;
    private Boolean hasMissingButtonsOrZippers = false;
    private Boolean isSanitized = true;
    private Boolean hasSevereFading = false;
    
    private String photoUrl;
    private String campusHostelLocation;
    private String additionalNotes;

    public GarmentAssessmentRequest() {}

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

    public String getFabricComposition() {
        return fabricComposition;
    }

    public void setFabricComposition(String fabricComposition) {
        this.fabricComposition = fabricComposition;
    }

    public String getWearDuration() {
        return wearDuration;
    }

    public void setWearDuration(String wearDuration) {
        this.wearDuration = wearDuration;
    }

    public Boolean getHasTears() {
        return hasTears;
    }

    public void setHasTears(Boolean hasTears) {
        this.hasTears = hasTears;
    }

    public Boolean getHasPermanentStains() {
        return hasPermanentStains;
    }

    public void setHasPermanentStains(Boolean hasPermanentStains) {
        this.hasPermanentStains = hasPermanentStains;
    }

    public Boolean getHasMissingButtonsOrZippers() {
        return hasMissingButtonsOrZippers;
    }

    public void setHasMissingButtonsOrZippers(Boolean hasMissingButtonsOrZippers) {
        this.hasMissingButtonsOrZippers = hasMissingButtonsOrZippers;
    }

    public Boolean getIsSanitized() {
        return isSanitized;
    }

    public void setIsSanitized(Boolean isSanitized) {
        this.isSanitized = isSanitized;
    }

    public Boolean getHasSevereFading() {
        return hasSevereFading;
    }

    public void setHasSevereFading(Boolean hasSevereFading) {
        this.hasSevereFading = hasSevereFading;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getCampusHostelLocation() {
        return campusHostelLocation;
    }

    public void setCampusHostelLocation(String campusHostelLocation) {
        this.campusHostelLocation = campusHostelLocation;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
}
