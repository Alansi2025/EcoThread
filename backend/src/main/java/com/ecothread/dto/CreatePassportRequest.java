package com.ecothread.dto;

import com.ecothread.model.ConditionGrade;
import jakarta.validation.constraints.NotBlank;

public class CreatePassportRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String category;

    private String materialComposition;
    private Double weightKg;
    private String sourceCampus;
    private ConditionGrade conditionGrade;
    private String finalOutcome;
    private String destinationPartner;
    private String imageUrl;
    private String qcNotes;

    public CreatePassportRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMaterialComposition() { return materialComposition; }
    public void setMaterialComposition(String materialComposition) { this.materialComposition = materialComposition; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getSourceCampus() { return sourceCampus; }
    public void setSourceCampus(String sourceCampus) { this.sourceCampus = sourceCampus; }

    public ConditionGrade getConditionGrade() { return conditionGrade; }
    public void setConditionGrade(ConditionGrade conditionGrade) { this.conditionGrade = conditionGrade; }

    public String getFinalOutcome() { return finalOutcome; }
    public void setFinalOutcome(String finalOutcome) { this.finalOutcome = finalOutcome; }

    public String getDestinationPartner() { return destinationPartner; }
    public void setDestinationPartner(String destinationPartner) { this.destinationPartner = destinationPartner; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getQcNotes() { return qcNotes; }
    public void setQcNotes(String qcNotes) { this.qcNotes = qcNotes; }
}
