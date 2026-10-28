package com.ecothread.dto;

public class ImpactStatsResponse {

    private long totalClothesDonated;
    private double totalWaterSavedLiters;
    private double totalCo2SavedKg;
    private long totalBeneficiariesClothed;
    private long totalPickupsCompleted;
    private long gradeACatalogCount;
    private long gradeBCommunityCount;
    private long recycleCount;

    public ImpactStatsResponse() {}

    public ImpactStatsResponse(long totalClothesDonated, double totalWaterSavedLiters, double totalCo2SavedKg,
                               long totalBeneficiariesClothed, long totalPickupsCompleted,
                               long gradeACatalogCount, long gradeBCommunityCount, long recycleCount) {
        this.totalClothesDonated = totalClothesDonated;
        this.totalWaterSavedLiters = totalWaterSavedLiters;
        this.totalCo2SavedKg = totalCo2SavedKg;
        this.totalBeneficiariesClothed = totalBeneficiariesClothed;
        this.totalPickupsCompleted = totalPickupsCompleted;
        this.gradeACatalogCount = gradeACatalogCount;
        this.gradeBCommunityCount = gradeBCommunityCount;
        this.recycleCount = recycleCount;
    }

    public long getTotalClothesDonated() {
        return totalClothesDonated;
    }

    public void setTotalClothesDonated(long totalClothesDonated) {
        this.totalClothesDonated = totalClothesDonated;
    }

    public double getTotalWaterSavedLiters() {
        return totalWaterSavedLiters;
    }

    public void setTotalWaterSavedLiters(double totalWaterSavedLiters) {
        this.totalWaterSavedLiters = totalWaterSavedLiters;
    }

    public double getTotalCo2SavedKg() {
        return totalCo2SavedKg;
    }

    public void setTotalCo2SavedKg(double totalCo2SavedKg) {
        this.totalCo2SavedKg = totalCo2SavedKg;
    }

    public long getTotalBeneficiariesClothed() {
        return totalBeneficiariesClothed;
    }

    public void setTotalBeneficiariesClothed(long totalBeneficiariesClothed) {
        this.totalBeneficiariesClothed = totalBeneficiariesClothed;
    }

    public long getTotalPickupsCompleted() {
        return totalPickupsCompleted;
    }

    public void setTotalPickupsCompleted(long totalPickupsCompleted) {
        this.totalPickupsCompleted = totalPickupsCompleted;
    }

    public long getGradeACatalogCount() {
        return gradeACatalogCount;
    }

    public void setGradeACatalogCount(long gradeACatalogCount) {
        this.gradeACatalogCount = gradeACatalogCount;
    }

    public long getGradeBCommunityCount() {
        return gradeBCommunityCount;
    }

    public void setGradeBCommunityCount(long gradeBCommunityCount) {
        this.gradeBCommunityCount = gradeBCommunityCount;
    }

    public long getRecycleCount() {
        return recycleCount;
    }

    public void setRecycleCount(long recycleCount) {
        this.recycleCount = recycleCount;
    }
}
