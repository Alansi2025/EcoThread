package com.ecothread.dto;

import com.ecothread.model.ConditionGrade;
import java.util.List;

public class GarmentAssessmentResponse {

    private String assessmentId;
    private String recommendedRoute; // "REUSE_BENEFICIARY_STORE", "REPAIR_AND_UPCYCLE", "COMMUNITY_SHELTER_BULK", "INDUSTRIAL_TEXTILE_RECYCLE"
    private ConditionGrade conditionGrade; // GRADE_A, GRADE_B, GRADE_C
    private Double confidenceScore; // e.g., 95.8
    private String confidenceLevel; // "High", "Moderate", "Requires Human QC"
    
    private String decisionRationale;
    private List<String> detectedFactors;
    private List<String> suggestedNextSteps;
    
    // Transparent Life Cycle Assessment (LCA) environmental projections
    private Double estimatedWaterSavedLiters;
    private Double estimatedCo2SavedKg;
    private String lcaBenchmarkSource; // e.g. "WRAP UK / Ellen MacArthur Textile LCA Standard"
    
    private String recommendedDestination;
    private String generatedPassportId;
    
    // Quality Score (0-100), Threshold Verdict, and Decision Action
    private Integer qualityScore; // 0 to 100
    private String actionVerdict; // "SELL_DONATE" (>=50) vs "RECYCLE" (<50)
    private Boolean isApprovedForNgo; // true if qualityScore >= 50

    public GarmentAssessmentResponse() {}

    public Integer getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Integer qualityScore) {
        this.qualityScore = qualityScore;
    }

    public String getActionVerdict() {
        return actionVerdict;
    }

    public void setActionVerdict(String actionVerdict) {
        this.actionVerdict = actionVerdict;
    }

    public Boolean getIsApprovedForNgo() {
        return isApprovedForNgo;
    }

    public void setIsApprovedForNgo(Boolean isApprovedForNgo) {
        this.isApprovedForNgo = isApprovedForNgo;
    }

    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getRecommendedRoute() {
        return recommendedRoute;
    }

    public void setRecommendedRoute(String recommendedRoute) {
        this.recommendedRoute = recommendedRoute;
    }

    public ConditionGrade getConditionGrade() {
        return conditionGrade;
    }

    public void setConditionGrade(ConditionGrade conditionGrade) {
        this.conditionGrade = conditionGrade;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(String confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public String getDecisionRationale() {
        return decisionRationale;
    }

    public void setDecisionRationale(String decisionRationale) {
        this.decisionRationale = decisionRationale;
    }

    public List<String> getDetectedFactors() {
        return detectedFactors;
    }

    public void setDetectedFactors(List<String> detectedFactors) {
        this.detectedFactors = detectedFactors;
    }

    public List<String> getSuggestedNextSteps() {
        return suggestedNextSteps;
    }

    public void setSuggestedNextSteps(List<String> suggestedNextSteps) {
        this.suggestedNextSteps = suggestedNextSteps;
    }

    public Double getEstimatedWaterSavedLiters() {
        return estimatedWaterSavedLiters;
    }

    public void setEstimatedWaterSavedLiters(Double estimatedWaterSavedLiters) {
        this.estimatedWaterSavedLiters = estimatedWaterSavedLiters;
    }

    public Double getEstimatedCo2SavedKg() {
        return estimatedCo2SavedKg;
    }

    public void setEstimatedCo2SavedKg(Double estimatedCo2SavedKg) {
        this.estimatedCo2SavedKg = estimatedCo2SavedKg;
    }

    public String getLcaBenchmarkSource() {
        return lcaBenchmarkSource;
    }

    public void setLcaBenchmarkSource(String lcaBenchmarkSource) {
        this.lcaBenchmarkSource = lcaBenchmarkSource;
    }

    public String getRecommendedDestination() {
        return recommendedDestination;
    }

    public void setRecommendedDestination(String recommendedDestination) {
        this.recommendedDestination = recommendedDestination;
    }

    public String getGeneratedPassportId() {
        return generatedPassportId;
    }

    public void setGeneratedPassportId(String generatedPassportId) {
        this.generatedPassportId = generatedPassportId;
    }
}
