package com.ecothread.dto;

public class DonorImpactResponse {

    private long totalPickupsCompleted;
    private long totalVerifiedGarments;
    private double waterSavedLiters;
    private double co2SavedKg;
    private double landfillDivertedKg;
    private double treesEquivalent;
    private double carKilometersSaved;
    private double taxDeductionEligibleAmount;
    private long activePickupsCount;
    private String donorName;

    public DonorImpactResponse() {}

    public DonorImpactResponse(long totalPickupsCompleted, long totalVerifiedGarments,
                               double waterSavedLiters, double co2SavedKg, double landfillDivertedKg,
                               double treesEquivalent, double carKilometersSaved,
                               double taxDeductionEligibleAmount, long activePickupsCount,
                               String donorName) {
        this.totalPickupsCompleted = totalPickupsCompleted;
        this.totalVerifiedGarments = totalVerifiedGarments;
        this.waterSavedLiters = waterSavedLiters;
        this.co2SavedKg = co2SavedKg;
        this.landfillDivertedKg = landfillDivertedKg;
        this.treesEquivalent = treesEquivalent;
        this.carKilometersSaved = carKilometersSaved;
        this.taxDeductionEligibleAmount = taxDeductionEligibleAmount;
        this.activePickupsCount = activePickupsCount;
        this.donorName = donorName;
    }

    public long getTotalPickupsCompleted() {
        return totalPickupsCompleted;
    }

    public void setTotalPickupsCompleted(long totalPickupsCompleted) {
        this.totalPickupsCompleted = totalPickupsCompleted;
    }

    public long getTotalVerifiedGarments() {
        return totalVerifiedGarments;
    }

    public void setTotalVerifiedGarments(long totalVerifiedGarments) {
        this.totalVerifiedGarments = totalVerifiedGarments;
    }

    public double getWaterSavedLiters() {
        return waterSavedLiters;
    }

    public void setWaterSavedLiters(double waterSavedLiters) {
        this.waterSavedLiters = waterSavedLiters;
    }

    public double getCo2SavedKg() {
        return co2SavedKg;
    }

    public void setCo2SavedKg(double co2SavedKg) {
        this.co2SavedKg = co2SavedKg;
    }

    public double getLandfillDivertedKg() {
        return landfillDivertedKg;
    }

    public void setLandfillDivertedKg(double landfillDivertedKg) {
        this.landfillDivertedKg = landfillDivertedKg;
    }

    public double getTreesEquivalent() {
        return treesEquivalent;
    }

    public void setTreesEquivalent(double treesEquivalent) {
        this.treesEquivalent = treesEquivalent;
    }

    public double getCarKilometersSaved() {
        return carKilometersSaved;
    }

    public void setCarKilometersSaved(double carKilometersSaved) {
        this.carKilometersSaved = carKilometersSaved;
    }

    public double getTaxDeductionEligibleAmount() {
        return taxDeductionEligibleAmount;
    }

    public void setTaxDeductionEligibleAmount(double taxDeductionEligibleAmount) {
        this.taxDeductionEligibleAmount = taxDeductionEligibleAmount;
    }

    public long getActivePickupsCount() {
        return activePickupsCount;
    }

    public void setActivePickupsCount(long activePickupsCount) {
        this.activePickupsCount = activePickupsCount;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }
}
